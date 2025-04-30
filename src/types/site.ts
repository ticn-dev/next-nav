import { Category } from './category'

export type ImageMode = 'url' | 'upload' | 'auto-fetch'

export interface Site {
  id: number
  displayName: string
  description: string | null
  url: string
  imageUrl: string | null
  imageMode: ImageMode
  order: number
  categoryId: number
  hided: boolean
}

export interface SiteWithCategory extends Site {
  category: Category
}
