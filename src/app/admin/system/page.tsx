import { SystemSettings } from '@/components/admin/system-settings'
import { prisma } from '@/lib/prisma'
import { getSystemSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

async function getSystemSettingsConfig() {
  const settings = await getSystemSettings('title', 'copyright')
  const metadata = await prisma.metaData.findMany()

  return {
    title: settings.title || 'Next Nav',
    copyright: settings.copyright,
    metadata,
  }
}

export const metadata = {
  title: '系统设置',
}

export default async function AdminPage() {
  const settings = await getSystemSettingsConfig()

  return (
    <div className="container mx-auto">
      <h1 className="mb-6 text-2xl font-bold">系统设置</h1>
      <SystemSettings initialSettings={settings} />
    </div>
  )
}
