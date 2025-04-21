'use client'

import type React from 'react'

import { createContext, useContext, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import type { CardThemeStyles, StyleSettingsRecord } from '@/types/settings'

interface StyleSettingsContextType {
  styleSettings: StyleSettingsRecord | null
  currentStyles: CardThemeStyles | null
  isLoading: boolean
}

const StyleSettingsContext = createContext<StyleSettingsContextType>({
  styleSettings: null,
  currentStyles: null,
  isLoading: true,
})

export function useStyleSettings() {
  return useContext(StyleSettingsContext)
}

interface StyleSettingsProviderProps {
  children: React.ReactNode
  initialSettings?: StyleSettingsRecord
}

export function StyleSettingsProvider({ children, initialSettings }: StyleSettingsProviderProps) {
  const [styleSettings, setStyleSettings] = useState<StyleSettingsRecord | null>(initialSettings || null)
  const [isLoading, setIsLoading] = useState(!initialSettings)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 确定当前应该使用的样式（基于当前主题）
  const currentStyles = styleSettings ? (theme === 'dark' ? styleSettings.darkMode : styleSettings.lightMode) : null

  // 客户端挂载后加载样式设置（如果没有初始设置）
  useEffect(() => {
    setMounted(true)

    // 如果没有初始设置，则从API获取
    if (!initialSettings) {
      setIsLoading(true)
      fetch('/api/admin/styles')
        .then((res) => res.json())
        .then((data) => {
          setStyleSettings(data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error('Error fetching style settings:', err)
          setIsLoading(false)
        })
    }
  }, [initialSettings])

  // 监听主题变化，确保样式正确应用
  useEffect(() => {
    if (!mounted) return
    // 主题变化时不需要重新获取数据，只需要重新计算currentStyles
    // 这已经在上面的计算中处理了
  }, [theme, mounted])

  return <StyleSettingsContext.Provider value={{ styleSettings, currentStyles, isLoading }}>{children}</StyleSettingsContext.Provider>
}
