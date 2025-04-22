import { Footer } from '@/components/footer'
import { prisma } from '@/lib/prisma'
import { getSystemSettings } from '@/lib/settings'
import Header from '@/components/header'
import type React from 'react'
import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { readData } from '@/lib/uploads'
import { resolveIconPath, SystemIconId } from '@/lib/path-resolver'
import CategoryFilterableRenderer from '@/components/category-filterable-renderer'
import { CategoryWithSites } from '@/types/category'

// This function enables ISR
export const revalidate = 3600 // revalidate every hour

const getCachedCategories = unstable_cache(
  async () => {
    console.log('Fetching categories from database for Home page')
    const categories = await prisma.category.findMany({
      include: {
        sites: {
          orderBy: [{ order: 'asc' }, { id: 'asc' }],
        },
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    })
    // Filter out empty categories
    return categories.filter((category) => category.sites.length > 0)
  },
  ['index'],
  { revalidate: 3600, tags: ['index'] },
)

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings('title')
  const title = settings.title || 'Next Nav'
  const metadata = await prisma.metaData.findMany()

  const iconData = await readData(resolveIconPath(SystemIconId), true)
  const iconType = (iconData?.metadata?.['content-type'] as string) || undefined
  const iconExt = (iconData?.metadata?.['file-ext'] as string) || ''
  const iconUrl = iconExt ? `/api/icon/this.${iconExt}` : undefined
  const iconObj = iconUrl ? [{ url: iconUrl, type: iconType }] : undefined

  const meta: Record<string, string> = {}
  metadata.forEach((item) => {
    meta[item.key] = item.value
  })

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    other: meta,
    icons: iconObj,
  }
}

export default async function Home() {
  const categories = await getCachedCategories()
  const systemSettings = await getSystemSettings('copyright')
  const copyright = systemSettings.copyright || 'Kairlec-NextNav'

  return (
    <>
      <Header />
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <CategoryFilterableRenderer initialCategories={categories as CategoryWithSites[]}></CategoryFilterableRenderer>
        <Footer copyright={copyright} />
      </div>
    </>
  )
}
