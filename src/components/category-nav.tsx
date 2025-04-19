'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'

interface Category {
  id: number
  name: string
  order: number
  sites: unknown[]
}

interface CategoryNavProps {
  className?: string
  categories: Category[]
}

export function CategoryNav({ className, categories }: CategoryNavProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(categories.length > 0 ? categories[0].id : null)
  const navRef = useRef<HTMLDivElement>(null)
  const activeCategoryRef = useRef<HTMLButtonElement>(null)
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

  // Scroll the active category into view when it changes
  useEffect(() => {
    if (activeCategory && navRef.current) {
      const activeButton = categoryRefs.current.get(activeCategory)
      if (activeButton) {
        // Calculate if the button is outside the visible area
        const navRect = navRef.current.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()

        const isAbove = buttonRect.top < navRect.top
        const isBelow = buttonRect.bottom > navRect.bottom

        if (isAbove || isBelow) {
          // Scroll the button into view with some padding
          activeButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          })
        }
      }
    }
  }, [activeCategory])

  const scrollToCategory = (categoryId: number) => {
    const element = document.getElementById(`category-${categoryId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <aside className={cn('bg-background w-64 shrink-0 border-r p-4', className)}>
      <div className="bg-background sticky top-0">
        <h2 className="text-lg font-semibold">分类导航</h2>
      </div>
      <nav className="h-[calc(100vh-9rem)] space-y-2 overflow-y-auto py-4" ref={navRef}>
        {categories.map((category) => (
          <Button
            key={category.id}
            ref={(el) => {
              if (el) {
                categoryRefs.current.set(category.id, el)
                if (activeCategory === category.id) {
                  activeCategoryRef.current = el
                }
              }
            }}
            variant={activeCategory === category.id ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => scrollToCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
