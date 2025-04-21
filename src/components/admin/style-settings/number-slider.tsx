'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

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

export function NumberSlider({ value, onChange, min, max, step, label, description, unit = 'px' }: NumberSliderProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`slider-${label}`}>
        {label} ({value}
        {unit})
      </Label>
      {description && <span className="text-muted-foreground text-sm">{description}</span>}
      <Slider id={`slider-${label}`} min={min} max={max} step={step} value={[value]} onValueChange={(values) => onChange(values[0])} />
    </div>
  )
}
