import type React from 'react'
import type { Metadata } from 'next'
import { getSystemSettings } from '@/lib/settings'
import { readData } from '@/lib/uploads'
import { resolveIconPath, SystemIconId } from '@/lib/path-resolver'
import { AdminSettingsProvider } from '@/components/next-nav/context/admin-settings-provider'
import { AdminMainComponent } from '@/components/admin/admin-main-component'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings('title', 'copyright')
  const title = settings.title || 'Next Nav'

  const iconData = await readData(resolveIconPath(SystemIconId), true)
  const iconType = (iconData?.metadata?.['content-type'] as string) || undefined
  const iconExt = (iconData?.metadata?.['file-ext'] as string) || ''
  const iconUrl = iconExt ? `/api/icon/this.${iconExt}` : undefined
  const iconObj = iconUrl ? [{ url: iconUrl, type: iconType }] : undefined

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    icons: iconObj,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSettingsProvider>
      <AdminMainComponent>{children}</AdminMainComponent>
    </AdminSettingsProvider>
  )
}
