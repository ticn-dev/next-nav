'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import type { CardThemeStyles } from '@/types/settings'

interface CardPreviewProps {
  theme: CardThemeStyles
  mode: 'light' | 'dark'
}

export function CardPreview({ theme, mode }: CardPreviewProps) {
  const { static: staticStyles, hover: hoverStyles } = theme
  const [isHovered, setIsHovered] = useState(false)

  const currentStyles = isHovered ? hoverStyles : staticStyles

  // 计算阴影样式
  const getShadowStyle = (size: number, color: string) => {
    return `0 ${size}px ${size * 2}px ${color}`
  }

  // 计算变换样式
  const getTransformStyle = () => {
    if (isHovered) {
      return `scale(${hoverStyles.scale}) translateY(-${hoverStyles.translateY}px)`
    }
    return 'scale(1) translateY(0)'
  }

  // 计算发光样式
  const getGlowStyle = () => {
    if (isHovered) {
      return {
        boxShadow: `0 0 10px ${hoverStyles.glowColor}`,
        opacity: hoverStyles.glowOpacity,
      }
    }
    return {
      boxShadow: 'none',
      opacity: 0,
    }
  }

  return (
    <div className={mode === 'dark' ? 'rounded-lg bg-slate-900 p-6' : 'rounded-lg border bg-white p-6'}>
      <div className="relative">
        {/* 发光效果 */}
        <div
          className="absolute -inset-0.5 rounded-lg transition-all duration-300"
          style={{
            ...getGlowStyle(),
            zIndex: -1,
          }}
        ></div>

        {/* 卡片 */}
        <div
          className="overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: currentStyles.backgroundColor,
            color: currentStyles.textColor,
            borderColor: currentStyles.borderColor,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: `${staticStyles.borderRadius}px`,
            boxShadow: getShadowStyle(currentStyles.shadowSize, currentStyles.shadowColor),
            transform: getTransformStyle(),
            cursor: 'pointer',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center gap-3 p-4">
            <Globe style={{ color: currentStyles.iconColor }} className="h-6 w-6" />
            <div className="text-base font-semibold" style={{ color: currentStyles.titleColor }}>
              示例站点
            </div>
          </div>
          <div className="p-4 pt-0">
            <div className="line-clamp-2 text-sm" style={{ color: currentStyles.descriptionColor }}>
              这是一个示例站点卡片，用于预览您的样式设置效果。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
