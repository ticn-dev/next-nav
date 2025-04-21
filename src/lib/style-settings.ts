import { prisma } from './prisma'
import type { StyleSettingsRecord, ThemePreset } from '@/types/settings'
import { defaultLightModeStaticStyles, defaultLightModeHoverStyles, defaultDarkModeStaticStyles, defaultDarkModeHoverStyles, defaultThemePresets } from './theme-presets'

// 默认样式设置
const defaultStyleSettings: StyleSettingsRecord = {
  activePresetId: 'default',
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
      key: 'styleSettings',
    },
  })

  if (!styleSettingsRecord || !styleSettingsRecord.value) {
    return defaultStyleSettings
  }

  try {
    return JSON.parse(styleSettingsRecord.value) as StyleSettingsRecord
  } catch (e) {
    console.error('Error parsing styleSettings:', e)
    return defaultStyleSettings
  }
}

// 更新样式设置
export async function updateStyleSettings(settings: StyleSettingsRecord): Promise<void> {
  await prisma.systemSettings.upsert({
    where: { key: 'styleSettings' },
    update: { value: JSON.stringify(settings) },
    create: { key: 'styleSettings', value: JSON.stringify(settings) },
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
export async function addThemePreset(preset: Omit<ThemePreset, 'id'>): Promise<StyleSettingsRecord> {
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
  if (presetId === 'default') {
    throw new Error('Cannot delete the default theme preset')
  }

  const updatedSettings: StyleSettingsRecord = {
    ...settings,
    presets: settings.presets.filter((p) => p.id !== presetId),
    // 如果删除的是当前激活的预设，则切换到默认预设
    activePresetId: settings.activePresetId === presetId ? 'default' : settings.activePresetId,
  }

  await updateStyleSettings(updatedSettings)
  return updatedSettings
}
