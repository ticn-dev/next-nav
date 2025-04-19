"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useEffect, useState } from "react"

interface Category {
  id: number
  name: string
  order: number
  sites: unknown[]
}

interface MobileMenuProps {
  categories: Category[]
}

export function MobileMenu({ categories }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent
      setOpen(customEvent.detail.isOpen)
    }

    document.addEventListener("toggleMobileMenu", handleToggle)

    return () => {
      document.removeEventListener("toggleMobileMenu", handleToggle)
    }
  }, [])

  const scrollToCategory = (categoryId: number) => {
    const element = document.getElementById(`category-${categoryId}`)
    if (element) {
      setOpen(false)
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" })
      }, 300)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-64 transition-transform duration-300">
        <SheetHeader>
          <SheetTitle>分类导航</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => scrollToCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
