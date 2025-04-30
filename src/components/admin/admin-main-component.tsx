'use client'

import { AdminHeader } from '@/components/next-nav/admin/admin-header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Footer } from '@/components/next-nav/common/footer'
import React, { useState } from 'react'
import { useAdminSettings } from '@/components/next-nav/context/admin-settings-provider'
import { useRouter } from 'next/navigation'

export function AdminMainComponent({ children }: { children: React.ReactNode }) {
  const { settings } = useAdminSettings()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handlerExitRequest = () => {
    router.push('/')
  }

  return (
    <div className="bg-background flex max-h-full min-h-screen flex-col">
      <AdminHeader
        showGithubButton={settings.showGithubButton}
        onExitRequest={handlerExitRequest}
        onToggleMobileMenuAction={() => {
          setOpen(!open)
        }}
      />
      <div className="flex h-full min-h-0 flex-1 items-stretch">
        <AdminSidebar className="hidden md:block" open={open} onOpenChange={setOpen} />
        <main className="flex flex-1 flex-col overflow-hidden p-6">
          <div className="max-h-full overflow-auto">{children}</div>
        </main>
      </div>
      {settings.copyright && <Footer copyright={settings.copyright} />}
    </div>
  )
}
