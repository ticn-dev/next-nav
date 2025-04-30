'use client'
import { Header } from './header'
import { CategoryFilterableRenderer } from '@/components/next-nav/category-filterable-renderer'
import { CategoryWithSites } from '@/types/category'
import { useState } from 'react'
import { Footer } from '@/components/next-nav/common/footer'
import { SettingsDialog } from '@/components/next-nav/settings-dialog'
import { useRouter } from 'next/navigation'

interface MainComponentProps {
  initialCategories: CategoryWithSites[]
  copyright?: string
  showGithubButton?: boolean
}

export function MainComponent({ initialCategories, copyright, showGithubButton }: MainComponentProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const router = useRouter()

  const handleAdminNavigation = () => {
    setIsSettingsOpen(false)
    router.push('/admin/system')
  }

  const handleMobileMenuSwitchRequest = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <Header onMobileMenuSwitchRequest={handleMobileMenuSwitchRequest} onSettingOpenRequest={() => setIsSettingsOpen(true)} showGithubButton={showGithubButton} />
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <CategoryFilterableRenderer initialCategories={initialCategories} menuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}></CategoryFilterableRenderer>
        {copyright && <Footer copyright={copyright} />}
      </div>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onAdminClick={handleAdminNavigation} />
    </>
  )
}
