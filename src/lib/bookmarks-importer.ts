import { Bookmarks } from '@/lib/bookmarks-parser'
import { prisma } from '@/lib/prisma'
import { ImageMode } from '@/types/site'
import { resolveIconPath } from '@/lib/path-resolver'
import { saveData } from '@/lib/uploads'

export async function saveBookmarksToDatabase(bookmarks: Bookmarks) {
  await prisma.$transaction(async (ctx) => {
    for (const category of bookmarks.categories) {
      const newCategory = await ctx.category.create({
        data: {
          displayName: category.title,
          order: 0,
        },
      })

      for (const bookmark of category.bookmarks) {
        let imageUrl = ''
        let imageMode: ImageMode = 'auto-fetch'
        let imageData: Uint8Array | undefined
        let contentType: string | undefined
        if (bookmark.icon) {
          try {
            const url = new URL(bookmark.icon)
            if (url.protocol === 'data:') {
              const base64 = url.href.split(',')[1]
              const buffer = Buffer.from(base64, 'base64')
              imageData = new Uint8Array(buffer)
              const mimeType = url.href.split(';')[0].split(':')[1]
              if (mimeType) {
                contentType = mimeType
              }
              imageMode = 'upload'
            } else if (url.protocol === 'http:' || url.protocol === 'https:') {
              imageMode = 'url'
              imageUrl = url.href
            }
          } catch (e) {
            console.error('Invalid URL for icon:', bookmark.icon, e)
            imageMode = 'auto-fetch'
            imageData = undefined
            contentType = undefined
          }
        }
        const site = await ctx.site.create({
          data: {
            displayName: bookmark.title,
            url: bookmark.url,
            description: null,
            imageUrl,
            imageMode,
            order: 0,
            categoryId: newCategory.id,
          },
        })
        if (imageMode === 'upload') {
          const iconPath = resolveIconPath(site.id)
          await saveData(iconPath, imageData!, { 'content-type': contentType })
        }
      }
    }
  })
}
