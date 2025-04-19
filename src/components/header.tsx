'use client'

import { Button } from '@/components/ui/button'
import { Menu, Settings } from 'lucide-react'
import { SiGithub as Github } from '@icons-pack/react-simple-icons'
import { ModeToggle } from './mode-toggle'
import { useState } from 'react'
import { SettingsDialog } from './settings-dialog'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const router = useRouter()

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    // Dispatch custom event for mobile menu component to listen to
    const event = new CustomEvent('toggleMobileMenu', {
      detail: { isOpen: !isMobileMenuOpen },
    })
    document.dispatchEvent(event)
  }

  const handleAdminNavigation = () => {
    setIsSettingsOpen(false)
    router.push('/admin/system')
  }

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onAdminClick={handleAdminNavigation} />
    </header>
  )
}
