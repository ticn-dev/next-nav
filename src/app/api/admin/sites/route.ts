import { prisma } from '@/lib/prisma'
import { fetchIcon } from '@/lib/favicon'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { submitBgTask } from '@/lib/background-task'
import { saveData } from '@/lib/uploads'
import { resolveIconPath } from '@/lib/path-resolver'

export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      include: {
        category: true,
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    })

    return NextResponse.json(sites)
  } catch (error) {
    console.error('Error fetching sites:', error)
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, url, imageUrl, imageData, imageFilename, description, categoryId, order } = await request.json()

    if (!title || !url || !categoryId) {
      return NextResponse.json({ error: 'Title, URL, and category are required' }, { status: 400 })
    }

    // Create the site
    const site = await prisma.site.create({
      data: {
        title,
        url,
        imageUrl: imageData ? '' : imageUrl,
        description,
        categoryId,
        order: order || 0,
      },
      include: {
        category: true,
      },
    })

    if (imageData) {
      submitBgTask(async () => {
        try {
          //parse base64 image data
          const segments = imageData.split(',')
          const base64Data = segments[1]
          const buffer = Buffer.from(base64Data, 'base64')
          const contentType = segments[0].split(':')[1].split(';')[0]

          const ext = imageFilename?.split('.').pop() as string | undefined

          const iconPath = resolveIconPath(site.id)

          await saveData(iconPath, buffer, { 'content-type': contentType, 'file-ext': ext })
        } catch (error) {
          console.error('Error saving image data:', error)
          // Continue without image
        }
      })
    } else {
      // If no image URL is provided, try to fetch the favicon
      if (!imageUrl) {
        submitBgTask(async () => {
          try {
            const icon = await fetchIcon(url)
            if (icon) {
              const iconPath = resolveIconPath(site.id)
              const url = icon.iconUrl
              const slashIdx = url.lastIndexOf('/')
              const dotIdx = url.lastIndexOf('.')
              const ext = dotIdx > slashIdx ? url.substring(dotIdx) : undefined

              await saveData(iconPath, icon.iconData, { 'content-type': icon.contentType, 'file-ext': ext })
            }
          } catch (error) {
            console.error('Error fetching favicon:', error)
            // Continue without favicon
          }
        })
      }
    }

    revalidateTag('index')

    return NextResponse.json(site)
  } catch (error) {
    console.error('Error creating site:', error)
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
  }
}
