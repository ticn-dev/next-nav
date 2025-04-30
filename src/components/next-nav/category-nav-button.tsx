'use client'

import { Button } from '@/components/ui/button'
import { Category } from '@/types/category'
import { Ref, MouseEvent } from 'react'

interface CategoryNavProps {
  className?: string
  category: Category
  active?: boolean
  onClick?: (e: MouseEvent) => void
  ref?: Ref<HTMLButtonElement>
}

export function CategoryNavButton({ category, active, onClick, ref }: CategoryNavProps) {
  return (
    <Button ref={ref} variant={active ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={(e) => onClick?.(e)}>
      {category.displayName}
    </Button>
  )
}
