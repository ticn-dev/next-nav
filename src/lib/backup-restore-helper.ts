import * as zip from '@zip.js/zip.js'
import {
  BackupRestoreOptions,
  ExtraDataProcessor,
  ExtraDataProvider,
  RestorableCategoryData,
  RestorableOperator,
  RestorableSiteData,
  RestorableSiteIconFiles,
  RestorableSystemFavicon,
  RestorableSystemMetadata,
  RestorableSystemSiteSettings,
} from '@/lib/backup-restore'
import { prisma } from '@/lib/prisma'
import { getSystemSettings, updateSystemSetting } from '@/lib/settings'
import { resolveIconPath, SystemIconId } from '@/lib/path-resolver'
import { deleteData, readData, saveData } from '@/lib/uploads'
import { Site } from '@/types/site'

export async function createRestorableOperator(loadOptions?: BackupRestoreOptions) {
  const restorableOperator: RestorableOperator = {
    systemSiteSettings: new RestorableSystemSiteSettings(),
    systemMetadata: new RestorableSystemMetadata(),
    systemFavicon: new RestorableSystemFavicon(),
    siteData: new RestorableSiteData(),
    categoryData: new RestorableCategoryData(),
    siteIconFiles: new RestorableSiteIconFiles(),
  }

  if (loadOptions) {
    if (loadOptions.systemSiteSettings) {
      const { title, copyright } = await getSystemSettings('title', 'copyright')
      restorableOperator.systemSiteSettings.title = title
      restorableOperator.systemSiteSettings.copyright = copyright
    }
    if (loadOptions.systemMetadata) {
      const metadata = await prisma.metaData.findMany()
      restorableOperator.systemMetadata.metadata = metadata.map((item) => ({ key: item.key, value: item.value }))
    }
    if (loadOptions.systemFavicon) {
      const iconPath = resolveIconPath(SystemIconId)
      const iconData = await readData(iconPath)
      if (iconData) {
        restorableOperator.systemFavicon.faviconMetadata = iconData.metadata
        restorableOperator.systemFavicon.favicon = iconData.data
      }
    }
    let siteData: Site[] | undefined = undefined
    if (loadOptions.siteData) {
      siteData = (await prisma.site.findMany()) as Site[]
      restorableOperator.siteData.sites = siteData
    }
    if (loadOptions.categoryData) {
      restorableOperator.categoryData.categories = await prisma.category.findMany()
    }
    if (loadOptions.siteIconFiles) {
      let siteIds: number[]
      if (siteData === undefined) {
        siteIds = await prisma.site.findMany({ select: { id: true } }).then((sites) => sites.map((site) => site.id))
      } else {
        siteIds = siteData.map((site) => site.id)
      }
      for (const siteId of siteIds) {
        const iconPath = resolveIconPath(siteId)
        const iconData = await readData(iconPath)
        if (iconData) {
          restorableOperator.siteIconFiles.append(siteId, iconData.data, iconData.metadata)
        }
      }
    }
  }

  return restorableOperator
}

export async function applyRestorableOperator(restorableOperator: RestorableOperator, saveOptions: BackupRestoreOptions) {
  await prisma.$transaction(async (ctx) => {
    if (saveOptions.systemSiteSettings) {
      await updateSystemSetting('title', restorableOperator.systemSiteSettings.title, ctx)
      await updateSystemSetting('copyright', restorableOperator.systemSiteSettings.copyright, ctx)
    }
    if (saveOptions.systemMetadata) {
      const metadata = restorableOperator.systemMetadata.metadata
      await ctx.metaData.deleteMany()
      await ctx.metaData.createMany({
        data: metadata,
      })
    }
    if (saveOptions.systemFavicon) {
      const iconPath = resolveIconPath(SystemIconId)
      if (restorableOperator.systemFavicon.favicon) {
        await saveData(iconPath, restorableOperator.systemFavicon.favicon, restorableOperator.systemFavicon.faviconMetadata)
      } else {
        await deleteData(iconPath)
      }
    }
    let categoryIds: Set<number> | undefined = undefined
    if (saveOptions.categoryData) {
      const categories = restorableOperator.categoryData.categories
      categoryIds = new Set(categories.map((category) => category.id))
      if (categoryIds.has(-1)) {
        await ctx.category.deleteMany()
      } else {
        await ctx.category.deleteMany({
          where: {
            id: {
              not: -1,
            },
          },
        })
      }
      await ctx.category.createMany({
        data: categories,
      })
    }
    if (saveOptions.siteData) {
      const sites = restorableOperator.siteData.sites
      if (categoryIds === undefined) {
        categoryIds = new Set((await ctx.category.findMany({ select: { id: true } })).map((category) => category.id))
      }
      for (const site of sites) {
        if (site.categoryId && !categoryIds.has(site.categoryId)) {
          site.categoryId = -1
        }
      }
      await ctx.site.deleteMany()
      await ctx.site.createMany({
        data: sites,
      })
    }
    if (saveOptions.siteIconFiles) {
      const siteIconFilesDescriptors = restorableOperator.siteIconFiles.siteIconFilesDescriptors
      for (const siteIconFilesDescriptor of siteIconFilesDescriptors) {
        const iconData = restorableOperator.siteIconFiles.siteIconFiles.get(siteIconFilesDescriptor.forSite)
        if (!iconData) {
          continue
        }
        const iconPath = resolveIconPath(siteIconFilesDescriptor.forSite)
        await saveData(iconPath, iconData, siteIconFilesDescriptor.metadata)
      }
    }
  })
}

const FIXED_FILES_NAME: Record<keyof BackupRestoreOptions, string> = {
  systemSiteSettings: 'systemSiteSettings.json',
  systemMetadata: 'systemMetadata.json',
  systemFavicon: 'systemFavicon.json',
  siteData: 'siteData.json',
  categoryData: 'categoryData.json',
  siteIconFiles: 'siteIconFiles.json',
} as const

export async function loadBackupFromZipFile(file: Uint8Array, loadOptions: BackupRestoreOptions, restorableOperator?: RestorableOperator): Promise<RestorableOperator> {
  if (!restorableOperator) {
    restorableOperator = await createRestorableOperator()
  }
  const zipReader = new zip.ZipReader(new zip.Uint8ArrayReader(file))
  const entries = await zipReader.getEntries()

  const entryMap = new Map<string, Uint8Array>()
  for (const entry of entries) {
    if (!entry.getData) {
      continue
    }
    const fileName = entry.filename
    const fileData = await entry.getData(new zip.Uint8ArrayWriter())
    entryMap.set(fileName, fileData)
  }

  const extraDataProvider: ExtraDataProvider = {
    provide(path: string): Promise<Uint8Array<ArrayBufferLike>> {
      const fileData = entryMap.get(path)
      if (fileData) {
        return Promise.resolve(fileData)
      }
      return Promise.reject(new Error(`File not found: ${path}`))
    },
  }

  const fixedFiles = Object.keys(FIXED_FILES_NAME) as Array<keyof BackupRestoreOptions>
  for (const key of fixedFiles) {
    if (loadOptions[key]) {
      const fileName = FIXED_FILES_NAME[key]
      const fileData = entryMap.get(fileName)
      if (fileData) {
        await restorableOperator[key].loadData(fileData, extraDataProvider)
      }
    }
  }

  return restorableOperator
}

export async function saveBackupAsZipFile(saveOptions: BackupRestoreOptions, restorableOperator?: RestorableOperator): Promise<Uint8Array> {
  if (!restorableOperator) {
    restorableOperator = await createRestorableOperator(saveOptions)
  }
  const zipWriter = new zip.ZipWriter(new zip.Uint8ArrayWriter())

  const extraDataProcessor: ExtraDataProcessor = {
    async process(path: string, data: Uint8Array): Promise<void> {
      await zipWriter.add(path, new zip.Uint8ArrayReader(data))
    },
  }

  const fixedFiles = Object.keys(FIXED_FILES_NAME) as Array<keyof BackupRestoreOptions>
  for (const key of fixedFiles) {
    if (saveOptions[key]) {
      const fileName = FIXED_FILES_NAME[key]
      const fileData = await restorableOperator[key].saveData(extraDataProcessor)
      await zipWriter.add(fileName, new zip.Uint8ArrayReader(fileData))
    }
  }

  return await zipWriter.close()
}
