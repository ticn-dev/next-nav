'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Category } from '@/types/category'
import { CategoryNavList } from '@/components/next-nav/category-nav-list'

interface MobileMenuProps {
  categories: Category[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCategoryClick?: (categoryId: number) => void
}

export function MobileMenu({ categories, open, onOpenChange }: MobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 transition-transform duration-300">
        <SheetHeader>
          <SheetTitle>分类导航</SheetTitle>
        </SheetHeader>
        <CategoryNavList categories={categories} onCategoryClick={() => onOpenChange?.(false)} />
      </SheetContent>
    </Sheet>
  )
}
