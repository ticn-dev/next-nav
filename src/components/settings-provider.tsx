'use client'

import type React from 'react'

import { createContext, useContext, useEffect, useState } from 'react'

interface Settings {
  openInNewTab: boolean
}

interface RendererSettings {
  showHiddenSites: boolean
}

interface SettingsContextType {
  settings: Settings
  rendererSettings: RendererSettings
  updateSettings: (settings: Partial<Settings>) => void
  updateRendererSettings: (settings: Partial<RendererSettings>) => void
}

const defaultSettings: Settings = {
  openInNewTab: true,
}

const defaultRendererSettings: RendererSettings = {
  showHiddenSites: false,
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [rendererSettings, setRendererSettings] = useState<RendererSettings>(defaultRendererSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    try {
      const savedSettings = localStorage.getItem('nav-settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    try {
      const savedRendererSettings = localStorage.getItem('nav-renderer-settings')
      if (savedRendererSettings) {
        setRendererSettings(JSON.parse(savedRendererSettings))
      }
    } catch (error) {
      console.error('Failed to load renderer settings:', error)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    // Save settings to localStorage when they change
    if (isLoaded) {
      localStorage.setItem('nav-settings', JSON.stringify(settings))
    }
  }, [settings, isLoaded])

  useEffect(() => {
    // Save settings to localStorage when they change
    if (isLoaded) {
      localStorage.setItem('nav-renderer-settings', JSON.stringify(rendererSettings))
    }
  }, [rendererSettings, isLoaded])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const updateRendererSettings = (newSettings: Partial<RendererSettings>) => {
    setRendererSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return <SettingsContext.Provider value={{ settings, rendererSettings, updateSettings, updateRendererSettings }}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
