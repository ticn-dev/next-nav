'use client'

import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import { SiGithub as Github } from '@icons-pack/react-simple-icons'
import { ModeToggle } from '../mode-toggle'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    // Dispatch custom event for mobile menu component to listen to
    const event = new CustomEvent('toggleAdminMobileMenu', {
      detail: { isOpen: !isMobileMenuOpen },
    })
    document.dispatchEvent(event)
  }

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <h1 className="text-xl font-bold">管理后台</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com/ticn-dev/next-nav" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">退出</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
