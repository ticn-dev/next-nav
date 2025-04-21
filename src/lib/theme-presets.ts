import type { CardBaseStyles, CardHoverStyles, ThemePreset } from '@/types/settings'

// 默认的浅色模式静止样式
export const defaultLightModeStaticStyles: CardBaseStyles = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  borderColor: '#e2e8f0',
  borderRadius: 12,
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowSize: 1,
  iconColor: '#0f172a',
  titleColor: '#000000',
  descriptionColor: '#64748b',
}

// 默认的浅色模式悬停样式
export const defaultLightModeHoverStyles: CardHoverStyles = {
  backgroundColor: '#f8fafc',
  textColor: '#000000',
  borderColor: '#3b82f6',
  shadowSize: 4,
  shadowColor: 'rgba(59, 130, 246, 0.3)',
  scale: 1.03,
  translateY: -4,
  iconColor: '#3b82f6',
  titleColor: '#3b82f6',
  descriptionColor: '#64748b',
  glowColor: '#3b82f6',
  glowOpacity: 0.7,
}

// 默认的深色模式静止样式
export const defaultDarkModeStaticStyles: CardBaseStyles = {
  backgroundColor: '#1e293b',
  textColor: '#f8fafc',
  borderColor: '#334155',
  borderRadius: 12,
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  shadowSize: 1,
  iconColor: '#94a3b8',
  titleColor: '#f8fafc',
  descriptionColor: '#94a3b8',
}

// 默认的深色模式悬停样式
export const defaultDarkModeHoverStyles: CardHoverStyles = {
  backgroundColor: '#0f172a',
  textColor: '#f8fafc',
  borderColor: '#6366f1',
  shadowSize: 4,
  shadowColor: 'rgba(99, 102, 241, 0.4)',
  scale: 1.03,
  translateY: -4,
  iconColor: '#818cf8',
  titleColor: '#818cf8',
  descriptionColor: '#94a3b8',
  glowColor: '#6366f1',
  glowOpacity: 0.7,
}

// 默认主题预设
export const defaultThemePresets: ThemePreset[] = [
  {
    id: 'default',
    name: '默认主题',
    description: '简洁现代的默认主题',
    lightMode: {
      static: defaultLightModeStaticStyles,
      hover: defaultLightModeHoverStyles,
    },
    darkMode: {
      static: defaultDarkModeStaticStyles,
      hover: defaultDarkModeHoverStyles,
    },
  },
  {
    id: 'minimal',
    name: '极简主题',
    description: '简约的极简风格主题',
    lightMode: {
      static: {
        ...defaultLightModeStaticStyles,
        borderRadius: 4,
        shadowSize: 0,
        borderColor: '#e2e8f0',
      },
      hover: {
        ...defaultLightModeHoverStyles,
        scale: 1.01,
        translateY: -2,
        shadowSize: 2,
        glowOpacity: 0,
      },
    },
    darkMode: {
      static: {
        ...defaultDarkModeStaticStyles,
        borderRadius: 4,
        shadowSize: 0,
        borderColor: '#334155',
      },
      hover: {
        ...defaultDarkModeHoverStyles,
        scale: 1.01,
        translateY: -2,
        shadowSize: 2,
        glowOpacity: 0,
      },
    },
  },
  {
    id: 'glassmorphism',
    name: '玻璃态主题',
    description: '现代玻璃态风格主题',
    lightMode: {
      static: {
        ...defaultLightModeStaticStyles,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: 'rgba(0, 0, 0, 0.05)',
      },
      hover: {
        ...defaultLightModeHoverStyles,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        glowOpacity: 0.5,
      },
    },
    darkMode: {
      static: {
        ...defaultDarkModeStaticStyles,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        borderColor: 'rgba(30, 41, 59, 0.2)',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
      },
      hover: {
        ...defaultDarkModeHoverStyles,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        glowOpacity: 0.5,
      },
    },
  },
  {
    id: 'colorful',
    name: '多彩主题',
    description: '丰富多彩的活力主题',
    lightMode: {
      static: {
        ...defaultLightModeStaticStyles,
        backgroundColor: '#ffffff',
        borderColor: '#f0f0f0',
        iconColor: '#8b5cf6',
      },
      hover: {
        ...defaultLightModeHoverStyles,
        backgroundColor: '#faf5ff',
        borderColor: '#8b5cf6',
        shadowColor: 'rgba(139, 92, 246, 0.3)',
        iconColor: '#7c3aed',
        titleColor: '#7c3aed',
        glowColor: '#8b5cf6',
      },
    },
    darkMode: {
      static: {
        ...defaultDarkModeStaticStyles,
        backgroundColor: '#1e1b4b',
        borderColor: '#312e81',
        iconColor: '#a78bfa',
      },
      hover: {
        ...defaultDarkModeHoverStyles,
        backgroundColor: '#2e1065',
        borderColor: '#7c3aed',
        shadowColor: 'rgba(139, 92, 246, 0.4)',
        iconColor: '#a78bfa',
        titleColor: '#a78bfa',
        glowColor: '#7c3aed',
      },
    },
  },
]
