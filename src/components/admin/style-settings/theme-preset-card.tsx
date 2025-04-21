'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import type { ThemePreset } from '@/types/settings'

interface ThemePresetCardProps {
  preset: ThemePreset
  isActive: boolean
  onApply: () => void
  onDelete?: () => void
}

export function ThemePresetCard({ preset, isActive, onApply, onDelete }: ThemePresetCardProps) {
  return (
    <Card className={`overflow-hidden transition-all ${isActive ? 'ring-primary ring-2' : ''}`}>
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
        <Button onClick={onApply} variant={isActive ? 'secondary' : 'default'} className="w-full">
          {isActive ? '当前使用中' : '应用此预设'}
        </Button>
      </CardContent>
    </Card>
  )
}
