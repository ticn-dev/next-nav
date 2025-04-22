'use client'

import { CategoryNav } from '@/components/category-nav'
import { CategorySection } from '@/components/category-section'
import React, { useEffect, useRef, useState } from 'react'
import { MobileMenu } from '@/components/mobile-menu'
import { CategoryWithSites } from '@/types/category'
import { useSearch } from '@/components/search-provider'
import { useDebouncedCallback } from 'use-debounce'
import { useSettings } from '@/components/settings-provider'
import { Site } from '@/types/site'

interface CategoryFilterableRendererProps {
  initialCategories: CategoryWithSites[]
}

function canDisplay(site: Site, rendererSettings: { showHiddenSites: boolean }) {
  return rendererSettings.showHiddenSites || !site.hided
}

export default function CategoryFilterableRenderer({ initialCategories }: CategoryFilterableRendererProps) {
  const { searchQuery } = useSearch()
  const [visibleCategories, setVisibleCategories] = useState<CategoryWithSites[]>(initialCategories)
  const [rendererCategories, setRendererCategories] = useState<CategoryWithSites[]>([])
  const { rendererSettings } = useSettings()

  const workerRef = useRef<Worker>(null)

  useEffect(() => {
    console.log('Renderer settings changed:', rendererSettings)
    setRendererCategories(
      visibleCategories
        .map((category) => {
          const filteredSites = category.sites.filter((site) => {
            return canDisplay(site, rendererSettings)
          })

          return {
            ...category,
            sites: filteredSites,
          }
        })
        .filter((category) => category.sites.length > 0),
    )
  }, [rendererSettings, visibleCategories])

  useEffect(() => {
    workerRef.current = new Worker(new URL('../search-worker.ts', import.meta.url))
    workerRef.current.onmessage = (event: MessageEvent<number[]>) => {
      console.debug('Worker completed calculation:', event.data)

      const filteredSiteIds = new Set(event.data)

      // render the filtered categories
      // Filter sites in each category
      const filtered = initialCategories
        .map((category) => {
          const filteredSites = category.sites.filter((site) => {
            return filteredSiteIds.has(site.id)
          })

          return {
            ...category,
            sites: filteredSites,
          }
        })
        .filter((category) => category.sites.length > 0)

      setVisibleCategories(filtered)
    }
    workerRef.current.onerror = (error: ErrorEvent) => {
      console.error('Worker error:', error)
    }
    workerRef.current.postMessage({ init: initialCategories })
    return () => {
      workerRef.current?.terminate()
    }
  }, [initialCategories])

  const handleSearchQueryChange = useDebouncedCallback(
    // function
    (searchQuery: string) => {
      console.debug('Debounced search query:', searchQuery)
      workerRef.current?.postMessage({ query: searchQuery })
    },
    150,
  )

  // Filter categories based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setVisibleCategories(initialCategories)
      return
    }

    handleSearchQueryChange(searchQuery.toLowerCase().trim())
  }, [searchQuery, rendererSettings, initialCategories, handleSearchQueryChange])

  return (
    <>
      <div className="px-4 py-2 md:hidden">
        <MobileMenu categories={rendererCategories} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Fixed sidebar for categories on desktop */}
        <CategoryNav categories={rendererCategories} className="hidden md:block" />

        {/* Scrollable content area for site listings */}
        <div className="flex-1 space-y-8 overflow-y-auto pb-6">
          {rendererCategories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </div>
      </div>
    </>
  )
}
