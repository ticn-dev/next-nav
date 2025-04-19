"use client"

import { useEffect, useRef } from "react"
import { SiteCard } from "./site-card"

interface Site {
  id: number
  title: string
  description: string | null
  url: string
  imageUrl: string | null
  order: number
  categoryId: number
}

interface Category {
  id: number
  name: string
  order: number
  sites: Site[]
}

interface CategorySectionProps {
  category: Category
}

export function CategorySection({ category }: CategorySectionProps) {
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        header.classList.toggle("is-sticky", !entry.isIntersecting)
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    )

    const sentinel = document.createElement("div")
    sentinel.className = "sentinel"
    header.parentNode?.insertBefore(sentinel, header)

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      sentinel.remove()
    }
  }, [])

  // Don't render empty categories
  if (category.sites.length === 0) {
    return null
  }

  return (
    <section id={`category-${category.id}`} className="category-section">
      <div ref={headerRef} className="sticky top-0 z-10 bg-background py-4">
        <h2 className="text-2xl font-bold">{category.name}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </section>
  )
}
