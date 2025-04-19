import { Category } from './category'

export interface Site {
  id: number
  title: string
  description: string | null
  url: string
  imageUrl: string | null
  order: number
  categoryId: number
  category: Category
}
