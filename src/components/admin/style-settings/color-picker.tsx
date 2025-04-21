'use client'

import type React from 'react'

import { useState, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label: string
  description?: string
}

export function ColorPicker({ color, onChange, label, description }: ColorPickerProps) {
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
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newColor) || /^rgba?$$\d+,\s*\d+,\s*\d+(?:,\s*\d+(?:\.\d+)?)?$$$/i.test(newColor)) {
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
            <button className="h-8 w-8 rounded-md border" style={{ backgroundColor: color }} aria-label={`选择${label}`} />
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
        <Input id={`color-${label}`} value={inputColor} onChange={handleHexInputChange} className="h-8 font-mono" placeholder="#000000" />
      </div>
    </div>
  )
}
