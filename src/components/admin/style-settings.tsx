"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { Globe, Plus, Trash2 } from "lucide-react"
import type {
  CardBaseStyles,
  CardHoverStyles,
  CardThemeStyles,
  StyleSettingsRecord,
  ThemePreset,
} from "@/types/settings"

// 颜色选择器组件
interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label: string
  description?: string
}

function ColorPicker({ color, onChange, label, description }: ColorPickerProps) {
  const [inputColor, setInputColor] = useState(color)
  const colorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputColor(color)
  }, [color])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setInputColor(newColor)
    onChange(newColor)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setInputColor(newColor)

    // 只有当输入是有效的十六进制颜色时才更新父组件
    if (
      /^#([0-9A-F]{3}){1,2}$/i.test(newColor) ||
      /^rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?$$$/i.test(newColor)
    ) {
      onChange(newColor)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`color-${label}`}>{label}</Label>
      {description && <span className="text-muted-foreground text-sm">{description}</span>}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="h-8 w-8 rounded-md border"
              style={{ backgroundColor: color }}
              aria-label={`选择${label}`}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`color-picker-${label}`}>选择颜色</Label>
              <input
                ref={colorInputRef}
                id={`color-picker-${label}`}
                type="color"
                value={inputColor}
                onChange={handleColorChange}
                className="h-8 w-full cursor-pointer appearance-none border-0 bg-transparent p-0"
              />
            </div>
          </PopoverContent>
        </Popover>
        <Input
          id={`color-${label}`}
          value={inputColor}
          onChange={handleHexInputChange}
          className="h-8 font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

// 数值滑块组件
interface NumberSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  label: string
  description?: string
  unit?: string
}

function NumberSlider({ value, onChange, min, max, step, label, description, unit = "px" }: NumberSliderProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`slider-${label}`}>
        {label} ({value}
        {unit})
      </Label>
      {description && <span className="text-muted-foreground text-sm">{description}</span>}
      <Slider
        id={`slider-${label}`}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
      />
    </div>
  )
}

// 卡片基本样式编辑器
interface CardBaseStylesEditorProps {
  styles: CardBaseStyles
  onChange: (styles: CardBaseStyles) => void
}

function CardBaseStylesEditor({ styles, onChange }: CardBaseStylesEditorProps) {
  const updateStyle = <K extends keyof CardBaseStyles>(key: K, value: CardBaseStyles[K]) => {
    onChange({
      ...styles,
      [key]: value,
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <ColorPicker
          label="背景颜色"
          description="卡片的背景颜色"
          color={styles.backgroundColor}
          onChange={(color) => updateStyle("backgroundColor", color)}
        />
        <ColorPicker
          label="边框颜色"
          description="卡片的边框颜色"
          color={styles.borderColor}
          onChange={(color) => updateStyle("borderColor", color)}
        />
        <ColorPicker
          label="阴影颜色"
          description="卡片阴影的颜色"
          color={styles.shadowColor}
          onChange={(color) => updateStyle("shadowColor", color)}
        />
      </div>
      <div className="space-y-4">
        <NumberSlider
          label="圆角大小"
          description="卡片边角的圆角半径"
          min={0}
          max={24}
          step={1}
          value={styles.borderRadius}
          onChange={(value) => updateStyle("borderRadius", value)}
        />
        <NumberSlider
          label="阴影大小"
          description="卡片阴影的大小"
          min={0}
          max={10}
          step={1}
          value={styles.shadowSize}
          onChange={(value) => updateStyle("shadowSize", value)}
        />
      </div>
      <div className="space-y-4">
        <ColorPicker
          label="图标颜色"
          description="卡片图标的颜色"
          color={styles.iconColor}
          onChange={(color) => updateStyle("iconColor", color)}
        />
        <ColorPicker
          label="标题颜色"
          description="卡片标题的颜色"
          color={styles.titleColor}
          onChange={(color) => updateStyle("titleColor", color)}
        />
        <ColorPicker
          label="描述文字颜色"
          description="卡片描述文字的颜色"
          color={styles.descriptionColor}
          onChange={(color) => updateStyle("descriptionColor", color)}
        />
      </div>
    </div>
  )
}

// 卡片悬停样式编辑器
interface CardHoverStylesEditorProps {
  styles: CardHoverStyles
  onChange: (styles: CardHoverStyles) => void
}

function CardHoverStylesEditor({ styles, onChange }: CardHoverStylesEditorProps) {
  const updateStyle = <K extends keyof CardHoverStyles>(key: K, value: CardHoverStyles[K]) => {
    onChange({
      ...styles,
      [key]: value,
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <ColorPicker
          label="背景颜色"
          description="悬停时卡片的背景颜色"
          color={styles.backgroundColor}
          onChange={(color) => updateStyle("backgroundColor", color)}
        />
        <ColorPicker
          label="边框颜色"
          description="悬停时卡片的边框颜色"
          color={styles.borderColor}
          onChange={(color) => updateStyle("borderColor", color)}
        />
        <ColorPicker
          label="阴影颜色"
          description="悬停时卡片阴影的颜色"
          color={styles.shadowColor}
          onChange={(color) => updateStyle("shadowColor", color)}
        />
        <ColorPicker
          label="发光颜色"
          description="悬停时卡片边缘发光的颜色"
          color={styles.glowColor}
          onChange={(color) => updateStyle("glowColor", color)}
        />
      </div>
      <div className="space-y-4">
        <NumberSlider
          label="阴影大小"
          description="悬停时卡片阴影的大小"
          min={0}
          max={20}
          step={1}
          value={styles.shadowSize}
          onChange={(value) => updateStyle("shadowSize", value)}
        />
        <NumberSlider
          label="缩放比例"
          description="悬停时卡片的缩放比例"
          min={1}
          max={1.2}
          step={0.01}
          value={styles.scale}
          onChange={(value) => updateStyle("scale", value)}
          unit="x"
        />
        <NumberSlider
          label="上移距离"
          description="悬停时卡片向上移动的距离"
          min={0}
          max={10}
          step={1}
          value={styles.translateY}
          onChange={(value) => updateStyle("translateY", value)}
        />
        <NumberSlider
          label="发光不透明度"
          description="悬停时卡片边缘发光的不透明度"
          min={0}
          max={1}
          step={0.1}
          value={styles.glowOpacity}
          onChange={(value) => updateStyle("glowOpacity", value)}
          unit=""
        />
      </div>
      <div className="space-y-4">
        <ColorPicker
          label="图标颜色"
          description="悬停时卡片图标的颜色"
          color={styles.iconColor}
          onChange={(color) => updateStyle("iconColor", color)}
        />
        <ColorPicker
          label="标题颜色"
          description="悬停时卡片标题的颜色"
          color={styles.titleColor}
          onChange={(color) => updateStyle("titleColor", color)}
        />
        <ColorPicker
          label="描述文字颜色"
          description="悬停时卡片描述文字的颜色"
          color={styles.descriptionColor}
          onChange={(color) => updateStyle("descriptionColor", color)}
        />
      </div>
    </div>
  )
}

// 卡片预览组件
interface CardPreviewProps {
  theme: CardThemeStyles
  mode: "light" | "dark"
}

function CardPreview({ theme, mode }: CardPreviewProps) {
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
    return "scale(1) translateY(0)"
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
      boxShadow: "none",
      opacity: 0,
    }
  }

  return (
    <div className={mode === "dark" ? "bg-slate-900 p-6 rounded-lg" : "bg-white p-6 rounded-lg border"}>
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
            borderWidth: "1px",
            borderStyle: "solid",
            borderRadius: `${staticStyles.borderRadius}px`,
            boxShadow: getShadowStyle(currentStyles.shadowSize, currentStyles.shadowColor),
            transform: getTransformStyle(),
            cursor: "pointer",
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

// 主题预设卡片组件
interface ThemePresetCardProps {
  preset: ThemePreset
  isActive: boolean
  onApply: () => void
  onDelete?: () => void
}

function ThemePresetCard({ preset, isActive, onApply, onDelete }: ThemePresetCardProps) {
  return (
    <Card className={`overflow-hidden transition-all ${isActive ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{preset.name}</CardTitle>
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">删除预设</span>
            </Button>
          )}
        </div>
        <CardDescription className="text-xs">{preset.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pb-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="overflow-hidden rounded border">
            <div className="bg-white p-2">
              <div
                className="h-12 rounded border"
                style={{
                  backgroundColor: preset.lightMode.static.backgroundColor,
                  borderColor: preset.lightMode.static.borderColor,
                }}
              ></div>
            </div>
          </div>
          <div className="overflow-hidden rounded border">
            <div className="bg-slate-900 p-2">
              <div
                className="h-12 rounded border"
                style={{
                  backgroundColor: preset.darkMode.static.backgroundColor,
                  borderColor: preset.darkMode.static.borderColor,
                }}
              ></div>
            </div>
          </div>
        </div>
        <Button onClick={onApply} variant={isActive ? "secondary" : "default"} className="w-full">
          {isActive ? "当前使用中" : "应用此预设"}
        </Button>
      </CardContent>
    </Card>
  )
}

// 主样式设置组件
interface StyleSettingsProps {
  initialSettings: StyleSettingsRecord
}

export function StyleSettings({ initialSettings }: StyleSettingsProps) {
  const [settings, setSettings] = useState<StyleSettingsRecord>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("presets")
  const [activeSubTab, setActiveSubTab] = useState<Record<string, string>>({
    light: "static",
    dark: "static",
  })

  const handleSaveStyleSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/styles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "保存成功",
          description: "卡片样式已更新",
        })
      } else {
        throw new Error("Failed to save styles")
      }
    } catch (error) {
      console.error("Error saving styles:", error)
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleApplyPreset = async (presetId: string) => {
    try {
      const response = await fetch(`/api/admin/styles/preset/${presetId}`, {
        method: "POST",
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        toast({
          title: "应用成功",
          description: "已应用所选主题预设",
        })
      } else {
        throw new Error("Failed to apply preset")
      }
    } catch (error) {
      console.error("Error applying preset:", error)
      toast({
        title: "应用失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handleDeletePreset = async (presetId: string) => {
    try {
      const response = await fetch(`/api/admin/styles/preset/${presetId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        toast({
          title: "删除成功",
          description: "已删除所选主题预设",
        })
      } else {
        throw new Error("Failed to delete preset")
      }
    } catch (error) {
      console.error("Error deleting preset:", error)
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const updateLightModeStyles = (mode: "static" | "hover", styles: any) => {
    setSettings((prev) => ({
      ...prev,
      lightMode: {
        ...prev.lightMode,
        [mode]: styles,
      },
    }))
  }

  const updateDarkModeStyles = (mode: "static" | "hover", styles: any) => {
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
                    onDelete={preset.id !== "default" ? () => handleDeletePreset(preset.id) : undefined}
                  />
                ))}
                <Card className="flex flex-col items-center justify-center p-6">
                  <Button variant="outline" className="h-20 w-20 rounded-full">
                    <Plus className="h-10 w-10" />
                  </Button>
                  <p className="mt-4 text-center text-sm font-medium">创建新预设</p>
                  <p className="text-center text-xs text-muted-foreground">基于当前样式创建新的主题预设</p>
                </Card>
              </div>
              <Button onClick={handleSaveStyleSettings} disabled={isSaving} className="mt-4">
                {isSaving ? "保存中..." : "保存"}
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
              <Tabs
                value={activeSubTab.light}
                onValueChange={(value) => setActiveSubTab((prev) => ({ ...prev, light: value }))}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="static" className="flex-1">
                    静止状态
                  </TabsTrigger>
                  <TabsTrigger value="hover" className="flex-1">
                    悬停状态
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="static" className="mt-4 space-y-4">
                  <CardBaseStylesEditor
                    styles={settings.lightMode.static}
                    onChange={(styles) => updateLightModeStyles("static", styles)}
                  />
                </TabsContent>
                <TabsContent value="hover" className="mt-4 space-y-4">
                  <CardHoverStylesEditor
                    styles={settings.lightMode.hover}
                    onChange={(styles) => updateLightModeStyles("hover", styles)}
                  />
                </TabsContent>
              </Tabs>

              <div className="mt-6 border-t pt-6">
                <h3 className="mb-4 text-lg font-medium">预览</h3>
                <CardPreview theme={settings.lightMode} mode="light" />
              </div>

              <Button onClick={handleSaveStyleSettings} disabled={isSaving} className="mt-4">
                {isSaving ? "保存中..." : "保存"}
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
              <Tabs
                value={activeSubTab.dark}
                onValueChange={(value) => setActiveSubTab((prev) => ({ ...prev, dark: value }))}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="static" className="flex-1">
                    静止状态
                  </TabsTrigger>
                  <TabsTrigger value="hover" className="flex-1">
                    悬停状态
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="static" className="mt-4 space-y-4">
                  <CardBaseStylesEditor
                    styles={settings.darkMode.static}
                    onChange={(styles) => updateDarkModeStyles("static", styles)}
                  />
                </TabsContent>
                <TabsContent value="hover" className="mt-4 space-y-4">
                  <CardHoverStylesEditor
                    styles={settings.darkMode.hover}
                    onChange={(styles) => updateDarkModeStyles("hover", styles)}
                  />
                </TabsContent>
              </Tabs>

              <div className="mt-6 border-t pt-6">
                <h3 className="mb-4 text-lg font-medium">预览</h3>
                <CardPreview theme={settings.darkMode} mode="dark" />
              </div>

              <Button onClick={handleSaveStyleSettings} disabled={isSaving} className="mt-4">
                {isSaving ? "保存中..." : "保存"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
