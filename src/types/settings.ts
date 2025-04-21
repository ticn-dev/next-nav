import type { MetaData } from './metadata'

export interface SystemSettingsRecord {
  title: string
  copyright: string
  metadata: MetaData[]
}

// 卡片基本样式
export interface CardBaseStyles {
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: number
  shadowColor: string
  shadowSize: number
  iconColor: string
  titleColor: string
  descriptionColor: string
}

// 卡片悬停样式
export interface CardHoverStyles {
  backgroundColor: string
  textColor: string
  borderColor: string
  shadowSize: number
  shadowColor: string
  scale: number
  translateY: number
  iconColor: string
  titleColor: string
  descriptionColor: string
  glowColor: string
  glowOpacity: number
}

// 完整的卡片样式（包含静止和悬停状态）
export interface CardThemeStyles {
  static: CardBaseStyles
  hover: CardHoverStyles
}

// 主题预设
export interface ThemePreset {
  id: string
  name: string
  description: string
  lightMode: CardThemeStyles
  darkMode: CardThemeStyles
}

// 样式设置记录
export interface StyleSettingsRecord {
  activePresetId: string | null
  presets: ThemePreset[]
  lightMode: CardThemeStyles
  darkMode: CardThemeStyles
}
