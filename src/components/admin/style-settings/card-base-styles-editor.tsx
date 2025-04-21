'use client'

import { ColorPicker } from './color-picker'
import { NumberSlider } from './number-slider'
import type { CardBaseStyles } from '@/types/settings'

interface CardBaseStylesEditorProps {
  styles: CardBaseStyles
  onChange: (styles: CardBaseStyles) => void
}

export function CardBaseStylesEditor({ styles, onChange }: CardBaseStylesEditorProps) {
  const updateStyle = <K extends keyof CardBaseStyles>(key: K, value: CardBaseStyles[K]) => {
    onChange({
      ...styles,
      [key]: value,
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <ColorPicker label="背景颜色" description="卡片的背景颜色" color={styles.backgroundColor} onChange={(color) => updateStyle('backgroundColor', color)} />
        <ColorPicker label="边框颜色" description="卡片的边框颜色" color={styles.borderColor} onChange={(color) => updateStyle('borderColor', color)} />
        <ColorPicker label="阴影颜色" description="卡片阴影的颜色" color={styles.shadowColor} onChange={(color) => updateStyle('shadowColor', color)} />
      </div>
      <div className="space-y-4">
        <NumberSlider label="圆角大小" description="卡片边角的圆角半径" min={0} max={24} step={1} value={styles.borderRadius} onChange={(value) => updateStyle('borderRadius', value)} />
        <NumberSlider label="阴影大小" description="卡片阴影的大小" min={0} max={10} step={1} value={styles.shadowSize} onChange={(value) => updateStyle('shadowSize', value)} />
      </div>
      <div className="space-y-4">
        <ColorPicker label="图标颜色" description="卡片图标的颜色" color={styles.iconColor} onChange={(color) => updateStyle('iconColor', color)} />
        <ColorPicker label="标题颜色" description="卡片标题的颜色" color={styles.titleColor} onChange={(color) => updateStyle('titleColor', color)} />
        <ColorPicker label="描述文字颜色" description="卡片描述文字的颜色" color={styles.descriptionColor} onChange={(color) => updateStyle('descriptionColor', color)} />
      </div>
    </div>
  )
}
