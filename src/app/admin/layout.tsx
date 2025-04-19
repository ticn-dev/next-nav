import type React from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import type { Metadata } from 'next'
import { getSystemSettings } from '@/lib/settings'
import { AdminFooter } from '@/components/admin/admin-footer'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings('title', 'copyright')
  const title = settings.title || 'Next Nav'

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    icons: '/api/icon/this',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSystemSettings('copyright')
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex min-h-0 flex-1">
        <AdminSidebar className="hidden md:block" />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <AdminFooter copyright={settings.copyright || 'Kairlec-NextNav'} />
    </div>
  )
}
