'use client'

import { CategorySection } from '@/components/next-nav/category-section'
import React, { useEffect, useRef, useState } from 'react'
import { CategoryWithSites } from '@/types/category'
import { CategoryNav } from '@/components/next-nav/category-nav'
import { MobileMenu } from '@/components/next-nav/mobile-menu'
import { useSearch } from '@/components/next-nav/context/search-provider'
import { useSettings } from '@/components/next-nav/context/settings-provider'
import { useDebouncedCallback } from 'use-debounce'
import { Site } from '@/types/site'

interface CategoryFilterableRendererProps {
  initialCategories: CategoryWithSites[]
  menuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
}

function canDisplay(site: Site, rendererSettings: { showHiddenSites: boolean }) {
  return rendererSettings.showHiddenSites || !site.hided
}

export function CategoryFilterableRenderer({ initialCategories, menuOpen, onMenuOpenChange }: CategoryFilterableRendererProps) {
  const { searchQuery } = useSearch()
  const [visibleCategories, setVisibleCategories] = useState<CategoryWithSites[]>(initialCategories)
  const [rendererCategories, setRendererCategories] = useState<CategoryWithSites[]>([])
  const { rendererSettings } = useSettings()

  const workerRef = useRef<Worker>(null)

  useEffect(() => {
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
    workerRef.current = new Worker(new URL('../../search-worker.ts', import.meta.url))
    workerRef.current.onmessage = (event: MessageEvent<number[]>) => {
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
        <MobileMenu categories={rendererCategories} open={menuOpen} onOpenChange={onMenuOpenChange} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Fixed sidebar for categories on desktop */}
        <CategoryNav categories={rendererCategories} className="hidden md:block" />

        {/* Scrollable content area for site listings */}
        <div className="flex flex-1 justify-center overflow-y-auto">
          <div className="w-full pb-6 transition-[width] duration-300 2xl:w-5/7">
            {rendererCategories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
