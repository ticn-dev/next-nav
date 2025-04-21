'use client'

import { useSettings } from '@/components/settings-provider'
import { Globe } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { Site } from '@/types/site'
import { useStyleSettings } from '@/components/style-settings-provider'
import '@/styles/site-card.css'

interface SiteCardProps {
  site: Site
}

export function SiteCard({ site }: SiteCardProps) {
  const [imageError, setImageError] = useState(false)
  const { settings } = useSettings()
  const { styleSettings } = useStyleSettings()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    window.open(site.url, settings.openInNewTab ? '_blank' : '_self')
  }

  // 使用站点ID作为图标URL（如果可用）
  const iconUrl = site.imageUrl || `/api/icon/${site.id}`

  // 当样式设置更新时，更新CSS变量
  useEffect(() => {
    if (!styleSettings) return

    const root = document.documentElement
    const theme = styleSettings.lightMode
    const darkTheme = styleSettings.darkMode

    // 设置亮色模式变量
    root.style.setProperty('--card-bg', theme.static.backgroundColor)
    root.style.setProperty('--card-text', theme.static.textColor)
    root.style.setProperty('--card-border', theme.static.borderColor)
    root.style.setProperty('--card-border-radius', `${theme.static.borderRadius}px`)
    root.style.setProperty('--card-shadow-color', theme.static.shadowColor)
    root.style.setProperty('--card-shadow-size', `${theme.static.shadowSize}px`)
    root.style.setProperty('--card-icon-color', theme.static.iconColor)
    root.style.setProperty('--card-title-color', theme.static.titleColor)
    root.style.setProperty('--card-description-color', theme.static.descriptionColor)

    root.style.setProperty('--card-hover-bg', theme.hover.backgroundColor)
    root.style.setProperty('--card-hover-text', theme.hover.textColor)
    root.style.setProperty('--card-hover-border', theme.hover.borderColor)
    root.style.setProperty('--card-hover-shadow-size', `${theme.hover.shadowSize}px`)
    root.style.setProperty('--card-hover-shadow-color', theme.hover.shadowColor)
    root.style.setProperty('--card-hover-scale', theme.hover.scale.toString())
    root.style.setProperty('--card-hover-translate-y', `${-theme.hover.translateY}px`)
    root.style.setProperty('--card-hover-icon-color', theme.hover.iconColor)
    root.style.setProperty('--card-hover-title-color', theme.hover.titleColor)
    root.style.setProperty('--card-hover-description-color', theme.hover.descriptionColor)
    root.style.setProperty('--card-glow-color', theme.hover.glowColor)
    root.style.setProperty('--card-glow-opacity', theme.hover.glowOpacity.toString())

    // 设置深色模式变量
    const darkRoot = document.createElement('style')
    darkRoot.innerHTML = `
      .dark {
        --card-bg: ${darkTheme.static.backgroundColor};
        --card-text: ${darkTheme.static.textColor};
        --card-border: ${darkTheme.static.borderColor};
        --card-border-radius: ${darkTheme.static.borderRadius}px;
        --card-shadow-color: ${darkTheme.static.shadowColor};
        --card-shadow-size: ${darkTheme.static.shadowSize}px;
        --card-icon-color: ${darkTheme.static.iconColor};
        --card-title-color: ${darkTheme.static.titleColor};
        --card-description-color: ${darkTheme.static.descriptionColor};
        
        --card-hover-bg: ${darkTheme.hover.backgroundColor};
        --card-hover-text: ${darkTheme.hover.textColor};
        --card-hover-border: ${darkTheme.hover.borderColor};
        --card-hover-shadow-size: ${darkTheme.hover.shadowSize}px;
        --card-hover-shadow-color: ${darkTheme.hover.shadowColor};
        --card-hover-scale: ${darkTheme.hover.scale};
        --card-hover-translate-y: ${-darkTheme.hover.translateY}px;
        --card-hover-icon-color: ${darkTheme.hover.iconColor};
        --card-hover-title-color: ${darkTheme.hover.titleColor};
        --card-hover-description-color: ${darkTheme.hover.descriptionColor};
        --card-glow-color: ${darkTheme.hover.glowColor};
        --card-glow-opacity: ${darkTheme.hover.glowOpacity};
      }
    `
    document.head.appendChild(darkRoot)

    return () => {
      document.head.removeChild(darkRoot)
    }
  }, [styleSettings])

  // 如果样式尚未加载，则使用默认样式
  if (!styleSettings) {
    return (
      <div
        aria-label="link"
        onClick={handleClick}
        className="group relative block transform cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-indigo-500/20"
      >
        <div className="flex items-center gap-3">
          {!imageError ? (
            <Image src={iconUrl || '/placeholder.svg'} alt={site.title} width={48} height={48} className="h-12 w-12 object-contain" onError={() => setImageError(true)} loading="lazy" />
          ) : (
            <Globe className="h-12 w-12" />
          )}
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{site.title}</h3>
        </div>
        {site.description && <div className="mt-2 line-clamp-4 text-sm text-gray-500 dark:text-gray-400">{site.description}</div>}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* 发光效果 */}
      <div
        className="site-card-glow"
        style={{
          backgroundColor: 'var(--card-glow-color)',
        }}
      ></div>

      {/* 卡片 */}
      <div
        aria-label="link"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="site-card"
        style={{
          backgroundColor: isHovered ? 'var(--card-hover-bg)' : 'var(--card-bg)',
          color: isHovered ? 'var(--card-hover-text)' : 'var(--card-text)',
          borderColor: isHovered ? 'var(--card-hover-border)' : 'var(--card-border)',
          borderRadius: 'var(--card-border-radius)',
          boxShadow: `0 ${isHovered ? 'var(--card-hover-shadow-size)' : 'var(--card-shadow-size)'} ${isHovered ? 'calc(var(--card-hover-shadow-size) * 2)' : 'calc(var(--card-shadow-size) * 2)'} ${isHovered ? 'var(--card-hover-shadow-color)' : 'var(--card-shadow-color)'}`,
          transform: isHovered ? `scale(var(--card-hover-scale)) translateY(var(--card-hover-translate-y))` : 'scale(1) translateY(0)',
        }}
      >
        <div className="site-card-content">
          {!imageError ? (
            <Image src={iconUrl || '/placeholder.svg'} alt={site.title} width={48} height={48} className="h-12 w-12 object-contain" onError={() => setImageError(true)} loading="lazy" />
          ) : (
            <Globe className="h-12 w-12" style={{ color: isHovered ? 'var(--card-hover-icon-color)' : 'var(--card-icon-color)' }} />
          )}
          <h3 className="site-card-title" style={{ color: isHovered ? 'var(--card-hover-title-color)' : 'var(--card-title-color)' }}>
            {site.title}
          </h3>
        </div>
        {site.description && (
          <div className="site-card-description" style={{ color: isHovered ? 'var(--card-hover-description-color)' : 'var(--card-description-color)' }}>
            {site.description}
          </div>
        )}
      </div>
    </div>
  )
}
