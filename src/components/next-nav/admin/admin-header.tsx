'use client'

import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import { SiGithub as Github } from '@icons-pack/react-simple-icons'
import { ThemeModeToggle } from '@/components/next-nav/common/theme-mode-toggle'
import Link from 'next/link'

export interface AdminHeaderProps {
  onToggleMobileMenuAction?: () => void
  onExitRequest?: () => void
  showGithubButton?: boolean
}

export function AdminHeader({ onToggleMobileMenuAction, onExitRequest, showGithubButton }: AdminHeaderProps) {
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleMobileMenuAction}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <h1 className="text-xl font-bold">管理后台</h1>
        </div>
        <div className="flex items-center gap-2">
          {showGithubButton && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://github.com/ticn-dev/next-nav" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
          )}
          <ThemeModeToggle />
          <Button variant="ghost" size="icon" onClick={() => onExitRequest?.()}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">退出</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
