'use client'

import { ColorPicker } from './color-picker'
import { NumberSlider } from './number-slider'
import type { CardHoverStyles } from '@/types/settings'

interface CardHoverStylesEditorProps {
  styles: CardHoverStyles
  onChange: (styles: CardHoverStyles) => void
}

export function CardHoverStylesEditor({ styles, onChange }: CardHoverStylesEditorProps) {
  const updateStyle = <K extends keyof CardHoverStyles>(key: K, value: CardHoverStyles[K]) => {
    onChange({
      ...styles,
      [key]: value,
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <ColorPicker label="背景颜色" description="悬停时卡片的背景颜色" color={styles.backgroundColor} onChange={(color) => updateStyle('backgroundColor', color)} />
        <ColorPicker label="边框颜色" description="悬停时卡片的边框颜色" color={styles.borderColor} onChange={(color) => updateStyle('borderColor', color)} />
        <ColorPicker label="阴影颜色" description="悬停时卡片阴影的颜色" color={styles.shadowColor} onChange={(color) => updateStyle('shadowColor', color)} />
        <ColorPicker label="发光颜色" description="悬停时卡片边缘发光的颜色" color={styles.glowColor} onChange={(color) => updateStyle('glowColor', color)} />
      </div>
      <div className="space-y-4">
        <NumberSlider label="阴影大小" description="悬停时卡片阴影的大小" min={0} max={20} step={1} value={styles.shadowSize} onChange={(value) => updateStyle('shadowSize', value)} />
        <NumberSlider label="缩放比例" description="悬停时卡片的缩放比例" min={1} max={1.2} step={0.01} value={styles.scale} onChange={(value) => updateStyle('scale', value)} unit="x" />
        <NumberSlider label="上移距离" description="悬停时卡片向上移动的距离" min={0} max={10} step={1} value={styles.translateY} onChange={(value) => updateStyle('translateY', value)} />
        <NumberSlider
          label="发光不透明度"
          description="悬停时卡片边缘发光的不透明度"
          min={0}
          max={1}
          step={0.1}
          value={styles.glowOpacity}
          onChange={(value) => updateStyle('glowOpacity', value)}
          unit=""
        />
      </div>
      <div className="space-y-4">
        <ColorPicker label="图标颜色" description="悬停时卡片图标的颜色" color={styles.iconColor} onChange={(color) => updateStyle('iconColor', color)} />
        <ColorPicker label="标题颜色" description="悬停时卡片标题的颜色" color={styles.titleColor} onChange={(color) => updateStyle('titleColor', color)} />
        <ColorPicker label="描述文字颜色" description="悬停时卡片描述文字的颜色" color={styles.descriptionColor} onChange={(color) => updateStyle('descriptionColor', color)} />
      </div>
    </div>
  )
}
