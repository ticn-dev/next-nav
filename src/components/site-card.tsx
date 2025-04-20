'use client'

import { useSettings } from '@/components/settings-provider'
import { Globe } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Site } from '@/types/site'

interface SiteCardProps {
  site: Site
}

export function SiteCard({ site }: SiteCardProps) {
  const [imageError, setImageError] = useState(false)
  const { settings } = useSettings()

  const handleClick = () => {
    window.open(site.url, settings.openInNewTab ? '_blank' : '_self')
  }

  // Use site ID for icon if available
  const iconUrl = site.imageUrl || `/api/icon/${site.id}`

  return (
    <div
      aria-label="link"
      onClick={handleClick}
      className="group relative block transform cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-indigo-500/20"
    >
      {/* Highlight effect on hover */}
      <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 dark:from-blue-900/20 dark:to-indigo-900/30"></div>

      {/* Border glow effect on hover */}
      <div className="absolute -inset-0.5 -z-20 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-70 group-hover:blur"></div>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300">
          {!imageError ? (
            <Image src={iconUrl} alt={site.title} width={48} height={48} className="h-12 w-12 object-contain" onError={() => setImageError(true)} loading="lazy" />
          ) : (
            <Globe className="h-12 w-12" />
          )}
        </div>
        <h3 className="font-medium text-gray-900 transition-colors duration-300 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">{site.title}</h3>
      </div>

      {/* Custom content if provided */}
      {site.description && <div className="mt-2 line-clamp-4 text-sm text-gray-500 dark:text-gray-400">{site.description}</div>}

      {/* Pulse indicator on hover */}
      <div className="absolute right-2 bottom-2 h-2 w-2 scale-0 rounded-full bg-blue-500 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 before:absolute before:inset-0 before:animate-ping before:rounded-full before:bg-blue-500 before:opacity-75 before:content-['']"></div>
    </div>
  )
}
