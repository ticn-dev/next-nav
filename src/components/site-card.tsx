'use client'

import { useSettings } from '@/components/settings-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Globe } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface Site {
  id: number
  title: string
  description: string | null
  url: string
  imageUrl: string | null
  categoryId: number
}

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
    <Card className="overflow-hidden transition-shadow hover:shadow-md" onClick={handleClick} role="link" tabIndex={0}>
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        {!imageError ? (
          <Image src={iconUrl || '/placeholder.svg'} alt={site.title} width={24} height={24} className="h-6 w-6 object-contain" onError={() => setImageError(true)} loading="lazy" />
        ) : (
          <Globe className="h-6 w-6" />
        )}
        <CardTitle className="text-base">{site.title}</CardTitle>
      </CardHeader>
      {site.description && (
        <CardContent className="p-4 pt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CardDescription className="line-clamp-2">{site.description}</CardDescription>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{site.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      )}
    </Card>
  )
}
