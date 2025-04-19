"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

interface Category {
  id: number
  name: string
  order: number
  sites: any[]
}

interface SidebarProps {
  className?: string
  categories?: Category[]
}

export function Sidebar({ className, categories: initialCategories }: SidebarProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories)
      setActiveCategory(initialCategories[0].id)
      return
    }

    // Only fetch if categories weren't provided as props
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data)
        if (data.length > 0) {
          setActiveCategory(data[0].id)
        }
      })

    // Set up intersection observer to update active category on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("category-", "")
            setActiveCategory(Number.parseInt(id))
          }
        })
      },
      { threshold: 0.5 },
    )

    // Observe all category sections
    document.querySelectorAll(".category-section").forEach((section) => {
      observer.observe(section)
    })

    return () => {
      observer.disconnect()
    }
  }, [initialCategories])

  const scrollToCategory = (categoryId: number) => {
    const element = document.getElementById(`category-${categoryId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <aside className={cn("w-64 shrink-0 border-r bg-background p-4", className)}>
      <nav className="space-y-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "secondary" : "ghost"}
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
