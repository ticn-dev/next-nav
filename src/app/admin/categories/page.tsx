import { CategoriesManager } from '@/components/admin/categories-manager'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  })

  return categories
}

export const metadata = {
  title: '分类设置',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">分类设置</h1>
      <CategoriesManager initialCategories={categories} />
    </div>
  )
}
