'use client'

import { Button } from '@/components/ui/button'
import { Menu, Search, Settings, X } from 'lucide-react'
import { SiGithub as Github } from '@icons-pack/react-simple-icons'
import { ModeToggle } from './mode-toggle'
import { useState, useEffect } from 'react'
import { SettingsDialog } from './settings-dialog'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearch } from './search-provider'
import { Input } from './ui/input'
import { twMerge } from 'tailwind-merge'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const router = useRouter()
  const { searchQuery, setSearchQuery, isSearchExpanded, setIsSearchExpanded } = useSearch()

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

  // Close expanded search on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchExpanded, setIsSearchExpanded])
  return (
    <>
      <header className="bg-background sticky top-0 z-40 w-full border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex md:flex-1 md:justify-center md:px-4">
            <div className="relative w-full max-w-md">
              <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
              <Input type="text" placeholder="搜索站点..." className="w-full pr-4 pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && (
                <Button variant="ghost" size="icon" className="absolute top-1/2 right-0 -translate-y-1/2" onClick={() => setSearchQuery('')}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Search Icon */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchExpanded(!isSearchExpanded)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

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

        {/* Mobile Expanded Search */}
        <div className={twMerge('bg-background border-t', isSearchExpanded ? 'mobile-search-expanded' : 'mobile-search-collapsed', 'md:hidden')}>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
            <Input type="text" placeholder="搜索站点..." className="w-full pr-10 pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
            <div
              className="absolute top-0 right-0 flex h-full cursor-pointer items-center pr-3"
              onClick={() => {
                setSearchQuery('')
                setIsSearchExpanded(false)
              }}
            >
              <X className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onAdminClick={handleAdminNavigation} />
    </>
  )
}
