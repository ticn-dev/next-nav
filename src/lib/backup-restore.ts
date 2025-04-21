import { Site } from '@/types/site'
import { Category } from '@/types/category'

export interface RestorableOperator {
  systemSiteSettings: RestorableSystemSiteSettings
  systemMetadata: RestorableSystemMetadata
  systemFavicon: RestorableSystemFavicon

  siteData: RestorableSiteData
  categoryData: RestorableCategoryData

  siteIconFiles: RestorableSiteIconFiles
}

export type BackupRestoreOptions = Record<keyof RestorableOperator, boolean>

export interface ExtraDataProvider {
  provide(path: string): Promise<Uint8Array>
}

export interface ExtraDataProcessor {
  process(path: string, data: Uint8Array): Promise<void>
}

export abstract class Restorable {
  abstract loadData(data: Uint8Array, extraDataProvider: ExtraDataProvider): Promise<void>

  abstract saveData(extraDataProcessor: ExtraDataProcessor): Promise<Uint8Array>

  protected static textDecoder = new TextDecoder()
  protected static textEncoder = new TextEncoder()
}

export class RestorableSystemSiteSettings extends Restorable {
  title: string = ''
  copyright: string = ''

  async loadData(data: Uint8Array) {
    const text = RestorableSystemSiteSettings.textDecoder.decode(data)
    const json = JSON.parse(text)
    this.title = json.title
    this.copyright = json.copyright
  }

  async saveData(): Promise<Uint8Array> {
    return RestorableSystemSiteSettings.textEncoder.encode(JSON.stringify({ title: this.title, copyright: this.copyright }))
  }
}

export class RestorableSystemMetadata extends Restorable {
  metadata: { key: string; value: string }[] = []

  async loadData(data: Uint8Array) {
    const text = RestorableSystemMetadata.textDecoder.decode(data)
    const json = JSON.parse(text)
    this.metadata = json.metadata
  }

  async saveData(): Promise<Uint8Array> {
    return RestorableSystemMetadata.textEncoder.encode(JSON.stringify({ metadata: this.metadata }))
  }
}

export class RestorableSystemFavicon extends Restorable {
  favicon: Uint8Array | undefined
  faviconMetadata: { contentType?: string; ext?: string } = {}

  async loadData(data: Uint8Array, extraDataProvider: ExtraDataProvider) {
    const text = RestorableSystemFavicon.textDecoder.decode(data)
    const json = JSON.parse(text)
    this.faviconMetadata = json.metadata
    const faviconPath = json.path
    if (faviconPath) {
      this.favicon = await extraDataProvider.provide(faviconPath)
    }
  }

  async saveData(extraDataProcessor: ExtraDataProcessor): Promise<Uint8Array> {
    if (this.favicon) {
      await extraDataProcessor.process(RestorableSystemFavicon.FaviconPath, this.favicon)
    }
    return RestorableSystemFavicon.textEncoder.encode(JSON.stringify({ path: RestorableSystemFavicon.FaviconPath, metadata: this.faviconMetadata }))
  }

  private static FaviconPath = '_assets/favicon/system'
}

export class RestorableSiteData extends Restorable {
  sites: Site[] = []

  async loadData(data: Uint8Array) {
    const text = RestorableSiteData.textDecoder.decode(data)
    const json = JSON.parse(text)
    this.sites = json.sites
  }

  async saveData(): Promise<Uint8Array> {
    return RestorableSiteData.textEncoder.encode(JSON.stringify({ sites: this.sites }))
  }
}

export class RestorableCategoryData extends Restorable {
  categories: Category[] = []

  async loadData(data: Uint8Array) {
    const text = RestorableCategoryData.textDecoder.decode(data)
    const json = JSON.parse(text)
    this.categories = json.categories
  }

  async saveData(): Promise<Uint8Array> {
    return RestorableCategoryData.textEncoder.encode(JSON.stringify({ categories: this.categories }))
  }
}

export class RestorableSiteIconFiles extends Restorable {
  siteIconFilesDescriptors: { forSite: number; dataPath: string; metadata: { contentType?: string; ext?: string } }[] = []
  siteIconFiles: Map<number, Uint8Array> = new Map()

  append(site: number | { id: number }, data: Uint8Array, metadata: { contentType?: string; ext?: string }) {
    const siteId = typeof site === 'number' ? site : site.id
    const iconPath = RestorableSiteIconFiles.getIconPath(siteId)
    this.siteIconFiles.set(siteId, data)
    this.siteIconFilesDescriptors.push({ forSite: siteId, dataPath: iconPath, metadata })
  }

  async loadData(data: Uint8Array, extraDataProvider: ExtraDataProvider) {
    const text = RestorableSiteIconFiles.textDecoder.decode(data)
    const json = JSON.parse(text)
    this.siteIconFilesDescriptors = json.siteIconFilesDescriptors

    for (const descriptor of this.siteIconFilesDescriptors) {
      const iconData = await extraDataProvider.provide(descriptor.dataPath)
      this.siteIconFiles.set(descriptor.forSite, iconData)
    }
  }

  async saveData(extraDataProcessor: ExtraDataProcessor): Promise<Uint8Array> {
    for (const descriptor of this.siteIconFilesDescriptors) {
      const siteId = descriptor.forSite
      const iconData = this.siteIconFiles.get(siteId)
      if (!iconData) {
        console.warn('No icon data found for site ID:', siteId)
      } else {
        await extraDataProcessor.process(descriptor.dataPath, iconData)
      }
    }
    return RestorableSiteIconFiles.textEncoder.encode(JSON.stringify({ siteIconFilesDescriptors: this.siteIconFilesDescriptors }))
  }

  private static getIconPath(siteId: number): string {
    return `_assets/favicon/site/${siteId}`
  }
}
