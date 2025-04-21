"use client"

import { useSettings } from "@/components/settings-provider"
import { Globe } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import type { Site } from "@/types/site"
import { useTheme } from "next-themes"
import type { CardBaseStyles, CardHoverStyles } from "@/types/settings"

interface SiteCardProps {
  site: Site
}

export function SiteCard({ site }: SiteCardProps) {
  const [imageError, setImageError] = useState(false)
  const { settings } = useSettings()
  const { theme } = useTheme()
  const [cardStyles, setCardStyles] = useState<{
    static: CardBaseStyles
    hover: CardHoverStyles
  } | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 在客户端加载样式设置
  useEffect(() => {
    setMounted(true)

    // 从服务器获取最新的样式设置
    fetch("/api/admin/styles")
      .then((res) => res.json())
      .then((data) => {
        const currentTheme = theme === "dark" ? "darkMode" : "lightMode"
        if (data[currentTheme]) {
          setCardStyles(data[currentTheme])
          localStorage.setItem("cardStyles", JSON.stringify(data[currentTheme]))
        }
      })
      .catch((err) => console.error("Error fetching card styles:", err))
  }, [theme])

  const handleClick = () => {
    window.open(site.url, settings.openInNewTab ? "_blank" : "_self")
  }

  // 使用站点ID作为图标URL（如果可用）
  const iconUrl = site.imageUrl || `/api/icon/${site.id}`

  // 如果组件尚未挂载或样式尚未加载，则使用默认样式
  if (!mounted || !cardStyles) {
    return (
      <div
        aria-label="link"
        onClick={handleClick}
        className="group relative block transform cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-indigo-500/20"
      >
        <div className="flex items-center gap-3">
          {!imageError ? (
            <Image
              src={iconUrl || "/placeholder.svg"}
              alt={site.title}
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <Globe className="h-12 w-12" />
          )}
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{site.title}</h3>
        </div>
        {site.description && (
          <div className="mt-2 line-clamp-4 text-sm text-gray-500 dark:text-gray-400">{site.description}</div>
        )}
      </div>
    )
  }

  // 计算当前样式
  const currentStyles = isHovered ? cardStyles.hover : cardStyles.static

  // 计算阴影样式
  const getShadowStyle = (size: number, color: string) => {
    return `0 ${size}px ${size * 2}px ${color}`
  }

  // 计算变换样式
  const getTransformStyle = () => {
    if (isHovered) {
      return `scale(${cardStyles.hover.scale}) translateY(-${cardStyles.hover.translateY}px)`
    }
    return "scale(1) translateY(0)"
  }

  // 使用自定义样式
  return (
    <div className="relative">
      {/* 发光效果 */}
      {isHovered && (
        <div
          className="absolute -inset-0.5 rounded-lg blur transition-opacity duration-300"
          style={{
            backgroundColor: cardStyles.hover.glowColor,
            opacity: cardStyles.hover.glowOpacity,
            zIndex: -1,
          }}
        ></div>
      )}

      {/* 卡片 */}
      <div
        aria-label="link"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative block cursor-pointer overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: currentStyles.backgroundColor,
          color: currentStyles.textColor,
          borderColor: currentStyles.borderColor,
          borderWidth: "1px",
          borderStyle: "solid",
          borderRadius: `${cardStyles.static.borderRadius}px`,
          boxShadow: getShadowStyle(
            isHovered ? cardStyles.hover.shadowSize : cardStyles.static.shadowSize,
            isHovered ? cardStyles.hover.shadowColor : cardStyles.static.shadowColor,
          ),
          transform: getTransformStyle(),
          padding: "0.75rem 1rem",
        }}
      >
        <div className="flex items-center gap-3">
          {!imageError ? (
            <Image
              src={iconUrl || "/placeholder.svg"}
              alt={site.title}
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <Globe
              className="h-12 w-12"
              style={{ color: isHovered ? cardStyles.hover.iconColor : cardStyles.static.iconColor }}
            />
          )}
          <h3
            className="font-medium"
            style={{ color: isHovered ? cardStyles.hover.titleColor : cardStyles.static.titleColor }}
          >
            {site.title}
          </h3>
        </div>
        {site.description && (
          <div
            className="mt-2 line-clamp-4 text-sm"
            style={{ color: isHovered ? cardStyles.hover.descriptionColor : cardStyles.static.descriptionColor }}
          >
            {site.description}
          </div>
        )}
      </div>
    </div>
  )
}
