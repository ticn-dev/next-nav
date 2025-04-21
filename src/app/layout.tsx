import type React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SettingsProvider } from '@/components/settings-provider'
import { Toaster } from '@/components/ui/sonner'
import { SearchProvider } from '@/components/search-provider'
import { Suspense } from 'react'
import { CustomThemeProvider } from '@/components/custom-theme-provider'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        <CustomThemeProvider>
          <SettingsProvider>
            <Suspense>
              <SearchProvider>
                <div className="flex max-h-full min-h-screen flex-col">{children}</div>
                <Toaster />
              </SearchProvider>
            </Suspense>
          </SettingsProvider>
        </CustomThemeProvider>
      </body>
    </html>
  )
}
