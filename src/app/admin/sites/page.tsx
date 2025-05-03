import { SitesManagerTable } from '@/components/admin/sites-manager-table'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '站点设置',
}

export default async function SitesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">站点设置</h1>
      <SitesManagerTable />
    </div>
  )
}
