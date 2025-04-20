'use client'

import { useSearch } from './search-provider'
import { CategorySection } from './category-section'
import { useState, useEffect } from 'react'

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

interface SearchResultsProps {
  categories: Category[]
}

export function SearchResults({ categories }: SearchResultsProps) {
  const { searchQuery } = useSearch()
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories)
      return
    }

    const query = searchQuery.toLowerCase().trim()

    // Filter sites in each category
    const filtered = categories
      .map((category) => {
        const filteredSites = category.sites.filter((site) => {
          return site.title.toLowerCase().includes(query) || site.url.toLowerCase().includes(query) || (site.description && site.description.toLowerCase().includes(query))
        })

        return {
          ...category,
          sites: filteredSites,
        }
      })
      .filter((category) => category.sites.length > 0)

    setFilteredCategories(filtered)
  }, [searchQuery, categories])

  if (searchQuery.trim() && filteredCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-2 text-2xl font-bold">未找到结果</h2>
        <p className="text-muted-foreground">没有找到与 &#34;{searchQuery}&#34; 相关的站点</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {filteredCategories.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}
    </div>
  )
}
