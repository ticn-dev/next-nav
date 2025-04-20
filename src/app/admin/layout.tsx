import type React from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import type { Metadata } from 'next'
import { getSystemSettings } from '@/lib/settings'
import { AdminFooter } from '@/components/admin/admin-footer'
import { readData } from '@/lib/uploads'
import { resolveIconPath, SystemIconId } from '@/lib/path-resolver'

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
  const settings = await getSystemSettings('copyright')
  return (
    <div className="bg-background flex max-h-full min-h-screen flex-col">
      <AdminHeader />
      <div className="flex h-full min-h-0 flex-1 items-stretch">
        <AdminSidebar className="hidden md:block" />
        <main className="flex flex-1 flex-col overflow-hidden p-6">
          <div className="max-h-full overflow-auto">{children}</div>
        </main>
      </div>
      <AdminFooter copyright={settings.copyright || 'Kairlec-NextNav'} />
    </div>
  )
}
