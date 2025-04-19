import { prisma } from './prisma'

export type SystemSettings = {
  title: string
  favicon: string
  copyright: string
}

type SystemSettingsKey = keyof SystemSettings

export async function getSystemSettings<T extends SystemSettingsKey>(column: T, ...moreColumns: T[]): Promise<{ [key in T]: string }>
export async function getSystemSettings(): Promise<SystemSettings>
export async function getSystemSettings(...columns: string[]): Promise<Partial<SystemSettings>> {
  prisma.systemSettings.findMany({
    where: {
      key: {
        in: columns,
      },
    },
  })
  const settingsRecords = await prisma.systemSettings.findMany()

  const settings: Record<string, string> = {}
  settingsRecords.forEach((record) => {
    settings[record.key] = record.value || ''
  })

  return {
    title: settings.title || '',
    favicon: settings.favicon || '',
    copyright: settings.copyright || '',
  }
}

export async function updateSystemSetting<T extends SystemSettingsKey>(key: T, value: SystemSettings[T]) {
  await prisma.systemSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}
