'use client'

import type React from 'react'

import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { type ThemeOption, getTheme } from '@/lib/themes'

type CustomThemeContextType = {
  customTheme: string
  setCustomTheme: (theme: string) => void
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined)

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [customTheme, setCustomTheme] = useState('default')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('custom-theme')
    if (savedTheme) {
      setCustomTheme(savedTheme)
    }
  }, [])

  // Apply theme CSS variables when theme changes
  useEffect(() => {
    if (!mounted) return

    const theme = getTheme(customTheme)
    applyTheme(theme)
    localStorage.setItem('custom-theme', customTheme)
  }, [customTheme, mounted])

  // Apply theme by setting CSS variables
  const applyTheme = (theme: ThemeOption) => {
    const root = document.documentElement

    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${kebabCase(key)}`, value)
    })

    // Apply border radius
    Object.entries(theme.radius).forEach(([key, value]) => {
      if (key === 'default') {
        root.style.setProperty('--radius', value)
      } else {
        root.style.setProperty(`--radius-${key}`, value)
      }
    })
  }

  return (
    <CustomThemeContext.Provider value={{ customTheme, setCustomTheme }}>
      <NextThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </NextThemeProvider>
    </CustomThemeContext.Provider>
  )
}

export function useCustomTheme() {
  const context = useContext(CustomThemeContext)
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider')
  }
  return context
}

// Helper function to convert camelCase to kebab-case
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}
