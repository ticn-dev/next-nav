import { Site } from '@/types/site'

export interface Category {
  id: number
  displayName: string
  order: number
}

export interface CategoryWithSiteIds extends Category {
  sites: { id: number }[]
}

export interface CategoryWithSites extends Category {
  sites: Site[]
}
