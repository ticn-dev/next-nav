import { CategoriesManagerTable } from '@/components/admin/categories-manager-table'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '分类设置',
}

export default async function CategoriesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">分类设置</h1>
      <CategoriesManagerTable />
    </div>
  )
}
