'use client'
import { Header } from './header'
import { CategoryFilterableRenderer } from '@/components/next-nav/category-filterable-renderer'
import { CategoryWithSites } from '@/types/category'
import { useEffect, useState } from 'react'
import { Footer } from '@/components/next-nav/common/footer'
import { SettingsDialog } from '@/components/next-nav/settings-dialog'
import { useRouter } from 'next/navigation'
import { EncryptedPayload } from '@/lib/aes/type'
import { decrypt } from '@/lib/aes/web'
import { Site } from '@/types/site'

interface MainComponentProps {
  initialCategories: CategoryWithSites[]
  copyright?: string
  showGithubButton?: boolean
  encryptedData: EncryptedPayload
}

export function MainComponent({ initialCategories, copyright, showGithubButton, encryptedData }: MainComponentProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [categories, setCategories] = useState<CategoryWithSites[]>(initialCategories)
  const router = useRouter()

  useEffect(() => {
    const key = localStorage.getItem('_hak')
    if (key) {
      decrypt(encryptedData, key)
        .then((decryptedData) => {
          const categoryMap = new Map<number, CategoryWithSites>(initialCategories.map((category) => [category.id, category]))

          const hidedSites = JSON.parse(decryptedData) as Site[]

          for (const hidedSite of hidedSites) {
            const category = categoryMap.get(hidedSite.categoryId)
            if (!category) {
              console.warn('Category not found for site:', hidedSite)
              continue
            }
            const index = category.sites.findIndex((site) => site.order > hidedSite.order || (site.order === hidedSite.order && site.id > hidedSite.id))
            if (index > 0) {
              const prevSite = category.sites[index - 1]
              if (prevSite.id == hidedSite.id) {
                continue
              }
            }
            if (index === -1) {
              category.sites.push(hidedSite)
            } else {
              category.sites.splice(index, 0, hidedSite)
            }

            const categories = categoryMap
              .values()
              .toArray()
              .filter((category) => category.sites.length !== 0)
            setCategories(categories)
          }
        })
        .catch((err) => {
          console.error('Decryption failed:', err)
        })
    }
  }, [initialCategories, encryptedData])

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
      <div className="flex min-h-0 flex-1 flex-col">
        <CategoryFilterableRenderer initialCategories={categories} menuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}></CategoryFilterableRenderer>
        {copyright && <Footer copyright={copyright} />}
      </div>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onAdminClick={handleAdminNavigation} />
    </>
  )
}
