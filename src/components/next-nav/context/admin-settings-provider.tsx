'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getSiteSettings } from '@/lib/api'
import { SystemSettingsRecord } from '@/types/settings'

interface AdminSettings extends SystemSettingsRecord {
  iconUrl: string
}

interface AdminSettingsContextType {
  settings: AdminSettings
  updateSettings: (settings: Partial<AdminSettings>) => void
  refresh: () => void
}

const defaultSettings: AdminSettings = {
  title: 'Next-Nav',
  copyright: '',
  showGithubButton: false,
  iconUrl: '/api/icon/this',
  metadata: [],
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined)

export function AdminSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings)

  useEffect(() => {
    getSiteSettings().then((s) => {
      console.log('fetched site settings:', s)
      setSettings({ ...s, iconUrl: `/api/icon/this?${new Date().getTime()}` })
    })
  }, [])

  useEffect(() => {
    {
      const currentTitle = document.title
      const prefix = currentTitle.split('|', 2)[0].trim()
      document.title = `${prefix} | ${settings.title || 'Next Nav'}`
    }
    {
      document.head.querySelector("link[rel='icon']")?.setAttribute('href', settings.iconUrl)
    }
  }, [settings])

  const refresh = () => {
    getSiteSettings().then((s) => {
      setSettings({ ...s, iconUrl: `/api/icon/this?${new Date().getTime()}` })
    })
  }

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return <AdminSettingsContext.Provider value={{ settings, refresh, updateSettings }}>{children}</AdminSettingsContext.Provider>
}

export function useAdminSettings() {
  const context = useContext(AdminSettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
