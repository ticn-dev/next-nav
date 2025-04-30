import { SystemSettings } from '@/components/admin/system-settings'
import { prisma } from '@/lib/prisma'
import { getSystemSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '系统设置',
}

export default async function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">系统设置</h1>
      <SystemSettings />
    </div>
  )
}
