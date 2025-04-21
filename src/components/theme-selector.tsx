'use client'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Palette } from 'lucide-react'
import { useCustomTheme } from './custom-theme-provider'
import { themes } from '@/lib/themes'

export function ThemeSelector() {
  const { customTheme, setCustomTheme } = useCustomTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
          <span className="sr-only">选择主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem key={theme.id} onClick={() => setCustomTheme(theme.id)} className={customTheme === theme.id ? 'bg-accent' : ''}>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.primary})` }}></div>
              <span>{theme.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
