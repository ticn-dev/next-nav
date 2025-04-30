'use client'

import { cn } from '@/lib/utils'
import { Category } from '@/types/category'
import { CategoryNavList } from './category-nav-list'

interface CategoryNavProps {
  className?: string
  categories: Category[]
}

export function CategoryNav({ className, categories }: CategoryNavProps) {
  return (
    <aside className={cn('bg-background w-64 shrink-0 border-r p-4', className)}>
      <div className="bg-background sticky top-0">
        <h2 className="text-lg font-semibold">分类导航</h2>
      </div>
      <nav className="h-[calc(100vh-9rem)] space-y-2 py-4">
        <CategoryNavList categories={categories} />
      </nav>
    </aside>
  )
}
