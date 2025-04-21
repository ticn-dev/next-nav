'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'
import type { StyleSettingsRecord } from '@/types/settings'

// 导入拆分后的组件
import { CardBaseStylesEditor } from './style-settings/card-base-styles-editor'
import { CardHoverStylesEditor } from './style-settings/card-hover-styles-editor'
import { CardPreview } from './style-settings/card-preview'
import { ThemePresetCard } from './style-settings/theme-preset-card'

// 主样式设置组件
interface StyleSettingsProps {
  initialSettings: StyleSettingsRecord
}

export function StyleSettings({ initialSettings }: StyleSettingsProps) {
  const [settings, setSettings] = useState<StyleSettingsRecord>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('presets')
  const [activeSubTab, setActiveSubTab] = useState<Record<string, string>>({
    light: 'static',
    dark: 'static',
  })

  const handleSaveStyleSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/styles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: '保存成功',
          description: '卡片样式已更新',
        })
      } else {
        throw new Error('Failed to save styles')
      }
    } catch (error) {
      console.error('Error saving styles:', error)
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleApplyPreset = async (presetId: string) => {
    try {
      const response = await fetch(`/api/admin/styles/preset/${presetId}`, {
        method: 'POST',
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        toast({
          title: '应用成功',
          description: '已应用所选主题预设',
        })
      } else {
        throw new Error('Failed to apply preset')
      }
    } catch (error) {
      console.error('Error applying preset:', error)
      toast({
        title: '应用失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    }
  }

  const handleDeletePreset = async (presetId: string) => {
    try {
      const response = await fetch(`/api/admin/styles/preset/${presetId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        toast({
          title: '删除成功',
          description: '已删除所选主题预设',
        })
      } else {
        throw new Error('Failed to delete preset')
      }
    } catch (error) {
      console.error('Error deleting preset:', error)
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    }
  }

  const updateLightModeStyles = (mode: 'static', styles: typeof settings.lightMode.static): void => {
    setSettings((prev) => ({
      ...prev,
      lightMode: {
        ...prev.lightMode,
        [mode]: styles,
      },
    }))
  }

  const updateLightModeHoverStyles = (mode: 'hover', styles: typeof settings.lightMode.hover): void => {
    setSettings((prev) => ({
      ...prev,
      lightMode: {
        ...prev.lightMode,
        [mode]: styles,
      },
    }))
  }

  const updateDarkModeStyles = (mode: 'static', styles: typeof settings.darkMode.static): void => {
    setSettings((prev) => ({
      ...prev,
      darkMode: {
        ...prev.darkMode,
        [mode]: styles,
      },
    }))
  }

  const updateDarkModeHoverStyles = (mode: 'hover', styles: typeof settings.darkMode.hover): void => {
    setSettings((prev) => ({
      ...prev,
      darkMode: {
        ...prev.darkMode,
        [mode]: styles,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="presets">主题预设</TabsTrigger>
          <TabsTrigger value="light">浅色模式</TabsTrigger>
          <TabsTrigger value="dark">深色模式</TabsTrigger>
        </TabsList>

        {/* 主题预设标签页 */}
        <TabsContent value="presets">
          <Card>
            <CardHeader>
              <CardTitle>主题预设</CardTitle>
              <CardDescription>选择一个预设主题或创建自定义主题</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {settings.presets.map((preset) => (
                  <ThemePresetCard
                    key={preset.id}
                    preset={preset}
                    isActive={settings.activePresetId === preset.id}
                    onApply={() => handleApplyPreset(preset.id)}
                    onDelete={preset.id !== 'default' ? () => handleDeletePreset(preset.id) : undefined}
                  />
                ))}
                <Card className="flex flex-col items-center justify-center p-6">
                  <Button variant="outline" className="h-20 w-20 rounded-full">
                    <Plus className="h-10 w-10" />
                  </Button>
                  <p className="mt-4 text-center text-sm font-medium">创建新预设</p>
                  <p className="text-muted-foreground text-center text-xs">基于当前样式创建新的主题预设</p>
                </Card>
              </div>
              <Button onClick={handleSaveStyleSettings} disabled={isSaving} className="mt-4">
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 浅色模式标签页 */}
        <TabsContent value="light">
          <Card>
            <CardHeader>
              <CardTitle>浅色模式样式</CardTitle>
              <CardDescription>自定义浅色模式下卡片的样式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeSubTab.light} onValueChange={(value) => setActiveSubTab((prev) => ({ ...prev, light: value }))}>
                <TabsList className="w-full">
                  <TabsTrigger value="static" className="flex-1">
                    静止状态
                  </TabsTrigger>
                  <TabsTrigger value="hover" className="flex-1">
                    悬停状态
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="static" className="mt-4 space-y-4">
                  <CardBaseStylesEditor styles={settings.lightMode.static} onChange={(styles) => updateLightModeStyles('static', styles)} />
                </TabsContent>
                <TabsContent value="hover" className="mt-4 space-y-4">
                  <CardHoverStylesEditor styles={settings.lightMode.hover} onChange={(styles) => updateLightModeHoverStyles('hover', styles)} />
                </TabsContent>
              </Tabs>

              <div className="mt-6 border-t pt-6">
                <h3 className="mb-4 text-lg font-medium">预览</h3>
                <CardPreview theme={settings.lightMode} mode="light" />
              </div>

              <Button onClick={handleSaveStyleSettings} disabled={isSaving} className="mt-4">
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 深色模式标签页 */}
        <TabsContent value="dark">
          <Card>
            <CardHeader>
              <CardTitle>深色模式样式</CardTitle>
              <CardDescription>自定义深色模式下卡片的样式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeSubTab.dark} onValueChange={(value) => setActiveSubTab((prev) => ({ ...prev, dark: value }))}>
                <TabsList className="w-full">
                  <TabsTrigger value="static" className="flex-1">
                    静止状态
                  </TabsTrigger>
                  <TabsTrigger value="hover" className="flex-1">
                    悬停状态
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="static" className="mt-4 space-y-4">
                  <CardBaseStylesEditor styles={settings.darkMode.static} onChange={(styles) => updateDarkModeStyles('static', styles)} />
                </TabsContent>
                <TabsContent value="hover" className="mt-4 space-y-4">
                  <CardHoverStylesEditor styles={settings.darkMode.hover} onChange={(styles) => updateDarkModeHoverStyles('hover', styles)} />
                </TabsContent>
              </Tabs>

              <div className="mt-6 border-t pt-6">
                <h3 className="mb-4 text-lg font-medium">预览</h3>
                <CardPreview theme={settings.darkMode} mode="dark" />
              </div>

              <Button onClick={handleSaveStyleSettings} disabled={isSaving} className="mt-4">
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
