import type React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SettingsProvider } from '@/components/settings-provider'
import { Toaster } from '@/components/ui/sonner'
import { SearchProvider } from '@/components/search-provider'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SettingsProvider>
            <Suspense>
              <SearchProvider>
                <div className="flex min-h-screen flex-col">{children}</div>
                <Toaster />
              </SearchProvider>
            </Suspense>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
