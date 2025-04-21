import { ImageMode } from '@/types/site'

export interface SiteRequest {
  title: string
  url: string
  imageUrl: string | null
  imageMode: ImageMode
  description: string | null
  categoryId: number
  order: number
}
