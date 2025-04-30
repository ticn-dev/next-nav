'use client'

import { useEffect, useRef, useState } from 'react'
import { Category } from '@/types/category'
import { CategoryNavButton } from '@/components/next-nav/category-nav-button'

interface CategoryNavProps {
  categories: Category[]
  onCategoryClick?: (category: Category) => void
}

export function CategoryNavList({ categories, onCategoryClick }: CategoryNavProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(categories.length > 0 ? categories[0].id : null)
  const categoryRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  // Set up intersection observer to update active category on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('category-', '')
            setActiveCategory(Number.parseInt(id))
          }
        })
      },
      { threshold: 0.3, rootMargin: '-100px 0px -100px 0px' },
    )

    // Observe all category sections
    document.querySelectorAll('.category-section').forEach((section) => {
      observer.observe(section)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    // Update active category if current one is not in filtered list
    if (!categories.some((c) => c.id === activeCategory)) {
      setActiveCategory(categories[0]?.id ?? null)
    }
  }, [activeCategory, categories])

  // Scroll the active category into view when it changes
  useEffect(() => {
    if (activeCategory) {
      const activeButton = categoryRefs.current.get(activeCategory)
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    }
  }, [activeCategory])

  const scrollToCategory = (category: Category) => {
    const element = document.getElementById(`category-${category.id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      onCategoryClick?.(category)
    }
  }

  if (categories.length === 0) {
    return <div className="text-muted-foreground text-sm">没有可显示的分类</div>
  }

  return (
    <div className="mt-6 h-full space-y-2 overflow-auto">
      {categories.map((category) => (
        <CategoryNavButton
          key={category.id}
          category={category}
          ref={(el) => {
            if (el) {
              categoryRefs.current.set(category.id, el)
            }
          }}
          active={activeCategory === category.id}
          onClick={() => scrollToCategory(category)}
        ></CategoryNavButton>
      ))}
    </div>
  )
}
