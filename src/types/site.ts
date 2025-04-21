import { Category } from './category'

export type ImageMode = 'url' | 'upload' | 'auto-fetch'

export interface Site {
  id: number
  title: string
  description: string | null
  url: string
  imageUrl: string | null
  imageMode: ImageMode
  order: number
  categoryId: number
}

export interface SiteWithCategory extends Site {
  category: Category
}
