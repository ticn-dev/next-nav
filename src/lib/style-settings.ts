import { prisma } from "./prisma"
import type { CardBaseStyles, CardHoverStyles, StyleSettingsRecord, ThemePreset } from "@/types/settings"

// 默认的浅色模式静止样式
const defaultLightModeStaticStyles: CardBaseStyles = {
  backgroundColor: "#ffffff",
  textColor: "#000000",
  borderColor: "#e2e8f0",
  borderRadius: 12,
  shadowColor: "rgba(0, 0, 0, 0.1)",
  shadowSize: 1,
  iconColor: "#0f172a",
  titleColor: "#000000",
  descriptionColor: "#64748b",
}

// 默认的浅色模式悬停样式
const defaultLightModeHoverStyles: CardHoverStyles = {
  backgroundColor: "#f8fafc",
  textColor: "#000000",
  borderColor: "#3b82f6",
  shadowSize: 4,
  shadowColor: "rgba(59, 130, 246, 0.3)",
  scale: 1.03,
  translateY: -4,
  iconColor: "#3b82f6",
  titleColor: "#3b82f6",
  descriptionColor: "#64748b",
  glowColor: "#3b82f6",
  glowOpacity: 0.7,
}

// 默认的深色模式静止样式
const defaultDarkModeStaticStyles: CardBaseStyles = {
  backgroundColor: "#1e293b",
  textColor: "#f8fafc",
  borderColor: "#334155",
  borderRadius: 12,
  shadowColor: "rgba(0, 0, 0, 0.3)",
  shadowSize: 1,
  iconColor: "#94a3b8",
  titleColor: "#f8fafc",
  descriptionColor: "#94a3b8",
}

// 默认的深色模式悬停样式
const defaultDarkModeHoverStyles: CardHoverStyles = {
  backgroundColor: "#0f172a",
  textColor: "#f8fafc",
  borderColor: "#6366f1",
  shadowSize: 4,
  shadowColor: "rgba(99, 102, 241, 0.4)",
  scale: 1.03,
  translateY: -4,
  iconColor: "#818cf8",
  titleColor: "#818cf8",
  descriptionColor: "#94a3b8",
  glowColor: "#6366f1",
  glowOpacity: 0.7,
}

// 默认主题预设
const defaultThemePresets: ThemePreset[] = [
  {
    id: "default",
    name: "默认主题",
    description: "简洁现代的默认主题",
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
    id: "minimal",
    name: "极简主题",
    description: "简约的极简风格主题",
    lightMode: {
      static: {
        ...defaultLightModeStaticStyles,
        borderRadius: 4,
        shadowSize: 0,
        borderColor: "#e2e8f0",
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
        borderColor: "#334155",
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
    id: "glassmorphism",
    name: "玻璃态主题",
    description: "现代玻璃态风格主题",
    lightMode: {
      static: {
        ...defaultLightModeStaticStyles,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        shadowColor: "rgba(0, 0, 0, 0.05)",
      },
      hover: {
        ...defaultLightModeHoverStyles,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "rgba(59, 130, 246, 0.3)",
        glowOpacity: 0.5,
      },
    },
    darkMode: {
      static: {
        ...defaultDarkModeStaticStyles,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        borderColor: "rgba(30, 41, 59, 0.2)",
        shadowColor: "rgba(0, 0, 0, 0.2)",
      },
      hover: {
        ...defaultDarkModeHoverStyles,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "rgba(99, 102, 241, 0.3)",
        glowOpacity: 0.5,
      },
    },
  },
  {
    id: "colorful",
    name: "多彩主题",
    description: "丰富多彩的活力主题",
    lightMode: {
      static: {
        ...defaultLightModeStaticStyles,
        backgroundColor: "#ffffff",
        borderColor: "#f0f0f0",
        iconColor: "#8b5cf6",
      },
      hover: {
        ...defaultLightModeHoverStyles,
        backgroundColor: "#faf5ff",
        borderColor: "#8b5cf6",
        shadowColor: "rgba(139, 92, 246, 0.3)",
        iconColor: "#7c3aed",
        titleColor: "#7c3aed",
        glowColor: "#8b5cf6",
      },
    },
    darkMode: {
      static: {
        ...defaultDarkModeStaticStyles,
        backgroundColor: "#1e1b4b",
        borderColor: "#312e81",
        iconColor: "#a78bfa",
      },
      hover: {
        ...defaultDarkModeHoverStyles,
        backgroundColor: "#2e1065",
        borderColor: "#7c3aed",
        shadowColor: "rgba(139, 92, 246, 0.4)",
        iconColor: "#a78bfa",
        titleColor: "#a78bfa",
        glowColor: "#7c3aed",
      },
    },
  },
]

// 默认样式设置
const defaultStyleSettings: StyleSettingsRecord = {
  activePresetId: "default",
  presets: defaultThemePresets,
  lightMode: {
    static: defaultLightModeStaticStyles,
    hover: defaultLightModeHoverStyles,
  },
  darkMode: {
    static: defaultDarkModeStaticStyles,
    hover: defaultDarkModeHoverStyles,
  },
}

// 获取样式设置
export async function getStyleSettings(): Promise<StyleSettingsRecord> {
  const styleSettingsRecord = await prisma.systemSettings.findUnique({
    where: {
      key: "styleSettings",
    },
  })

  if (!styleSettingsRecord || !styleSettingsRecord.value) {
    return defaultStyleSettings
  }

  try {
    return JSON.parse(styleSettingsRecord.value) as StyleSettingsRecord
  } catch (e) {
    console.error("Error parsing styleSettings:", e)
    return defaultStyleSettings
  }
}

// 更新样式设置
export async function updateStyleSettings(settings: StyleSettingsRecord): Promise<void> {
  await prisma.systemSettings.upsert({
    where: { key: "styleSettings" },
    update: { value: JSON.stringify(settings) },
    create: { key: "styleSettings", value: JSON.stringify(settings) },
  })
}

// 应用主题预设
export async function applyThemePreset(presetId: string): Promise<StyleSettingsRecord> {
  const settings = await getStyleSettings()
  const preset = settings.presets.find((p) => p.id === presetId)

  if (!preset) {
    throw new Error(`Theme preset with id ${presetId} not found`)
  }

  const updatedSettings: StyleSettingsRecord = {
    ...settings,
    activePresetId: presetId,
    lightMode: preset.lightMode,
    darkMode: preset.darkMode,
  }

  await updateStyleSettings(updatedSettings)
  return updatedSettings
}

// 添加新的主题预设
export async function addThemePreset(preset: Omit<ThemePreset, "id">): Promise<StyleSettingsRecord> {
  const settings = await getStyleSettings()
  const newPreset: ThemePreset = {
    ...preset,
    id: `preset-${Date.now()}`,
  }

  const updatedSettings: StyleSettingsRecord = {
    ...settings,
    presets: [...settings.presets, newPreset],
  }

  await updateStyleSettings(updatedSettings)
  return updatedSettings
}

// 删除主题预设
export async function deleteThemePreset(presetId: string): Promise<StyleSettingsRecord> {
  const settings = await getStyleSettings()

  // 不允许删除默认预设
  if (presetId === "default") {
    throw new Error("Cannot delete the default theme preset")
  }

  const updatedSettings: StyleSettingsRecord = {
    ...settings,
    presets: settings.presets.filter((p) => p.id !== presetId),
    // 如果删除的是当前激活的预设，则切换到默认预设
    activePresetId: settings.activePresetId === presetId ? "default" : settings.activePresetId,
  }

  await updateStyleSettings(updatedSettings)
  return updatedSettings
}
