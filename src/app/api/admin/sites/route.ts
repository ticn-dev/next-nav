import { prisma } from '@/lib/prisma'
import { fetchIcon } from '@/lib/favicon'
import { type NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { submitBgTask } from '@/lib/background-task'
import { saveData } from '@/lib/uploads'
import { resolveIconPath } from '@/lib/path-resolver'
import { Site } from '@/types/site'

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

export async function PUT(request: Request) {
  try {
    const formData = await request.formData()
    let parsedRequest: Omit<Site, 'id'>
    try {
      const requestStr = formData.get('request')
      if (typeof requestStr !== 'string') {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
      }
      parsedRequest = JSON.parse(requestStr)
    } catch (e) {
      console.error('Error parsing request:', e)
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    if (!parsedRequest.displayName || !parsedRequest.url || !parsedRequest.categoryId) {
      return NextResponse.json({ error: 'Title, URL, and category are required' }, { status: 400 })
    }

    let useImageUrl: string | null = null
    let imageData: File

    if (parsedRequest.imageMode === 'url') {
      useImageUrl = parsedRequest.imageUrl
      if (!useImageUrl) {
        return NextResponse.json({ error: 'Image URL is required when image mode is "url"' }, { status: 400 })
      }
      try {
        new URL(useImageUrl)
      } catch (e) {
        console.warn('Invalid image URL:', useImageUrl, e)
        return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
      }
    } else if (parsedRequest.imageMode === 'upload') {
      const imagePart = formData.get('imageData')
      if (!(imagePart instanceof File)) {
        return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
      }
      imageData = imagePart
    } else if (parsedRequest.imageMode === 'auto-fetch') {
      // Do nothing, auto-fetch will be handled later
    } else {
      return NextResponse.json({ error: 'Invalid image mode' }, { status: 400 })
    }

    // Create the site
    const site = await prisma.site.create({
      data: {
        displayName: parsedRequest.displayName,
        url: parsedRequest.url,
        imageUrl: useImageUrl,
        imageMode: parsedRequest.imageMode,
        description: parsedRequest.description,
        categoryId: parsedRequest.categoryId,
        order: parsedRequest.order || 0,
        hided: parsedRequest.hided || false,
      },
      include: {
        category: true,
      },
    })

    if (parsedRequest.imageMode === 'upload') {
      submitBgTask(async () => {
        try {
          const data = await imageData.bytes()
          const contentType = imageData.type
          const filename = imageData.name

          const ext = filename?.split('.').pop() as string | undefined

          const iconPath = resolveIconPath(site.id)

          await saveData(iconPath, data, { 'content-type': contentType, 'file-ext': ext })
        } catch (error) {
          console.error('Error saving image data:', error)
          // Continue without image
        }
      })
    } else if (parsedRequest.imageMode === 'auto-fetch') {
      submitBgTask(async () => {
        try {
          const icon = await fetchIcon(parsedRequest.url)
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

    revalidateTag('index')

    return NextResponse.json(site)
  } catch (error) {
    console.error('Error creating site:', error)
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const formData = await request.formData()
    let parsedRequest: Omit<Site, 'id'>
    let ids: number[]
    try {
      const requestStr = formData.get('request')
      if (typeof requestStr !== 'string') {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
      }
      parsedRequest = JSON.parse(requestStr)
      const idsStr = formData.get('ids')
      if (typeof idsStr !== 'string') {
        return NextResponse.json({ error: 'Invalid ids' }, { status: 400 })
      }
      ids = JSON.parse(idsStr)
    } catch (e) {
      console.error('Error parsing request:', e)
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    if (!parsedRequest.displayName || !parsedRequest.url || !parsedRequest.categoryId) {
      return NextResponse.json({ error: 'Title, URL, and category are required' }, { status: 400 })
    }

    let useImageUrl: string | null = null
    let imageData: File

    if (parsedRequest.imageMode === 'url') {
      useImageUrl = parsedRequest.imageUrl
      if (!useImageUrl) {
        return NextResponse.json({ error: 'Image URL is required when image mode is "url"' }, { status: 400 })
      }
      try {
        new URL(useImageUrl)
      } catch (e) {
        console.warn('Invalid image URL:', useImageUrl, e)
        return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
      }
    } else if (parsedRequest.imageMode === 'upload') {
      const imagePart = formData.get('imageData')
      if (!(imagePart instanceof File)) {
        return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
      }
      imageData = imagePart
    } else if (parsedRequest.imageMode === 'auto-fetch') {
      // Do nothing, auto-fetch will be handled later
    } else {
      return NextResponse.json({ error: 'Invalid image mode' }, { status: 400 })
    }

    // update the site
    const sites = await prisma.site.updateManyAndReturn({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        displayName: parsedRequest.displayName,
        url: parsedRequest.url,
        imageUrl: useImageUrl,
        imageMode: parsedRequest.imageMode,
        description: parsedRequest.description,
        categoryId: parsedRequest.categoryId,
        order: parsedRequest.order || 0,
        hided: parsedRequest.hided || false,
      },
      include: {
        category: true,
      },
    })

    if (parsedRequest.imageMode === 'upload') {
      submitBgTask(async () => {
        for (const site of sites) {
          try {
            const data = await imageData.bytes()
            const contentType = imageData.type
            const filename = imageData.name

            const ext = filename?.split('.').pop() as string | undefined

            const iconPath = resolveIconPath(site.id)

            await saveData(iconPath, data, { 'content-type': contentType, 'file-ext': ext })
          } catch (error) {
            console.error('Error saving image data:', error)
            // Continue without image
          }
        }
      })
    } else if (parsedRequest.imageMode === 'auto-fetch') {
      submitBgTask(async () => {
        for (const site of sites) {
          try {
            const icon = await fetchIcon(parsedRequest.url)
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
        }
      })
    }

    revalidateTag('index')

    return NextResponse.json(sites)
  } catch (error) {
    console.error('Error patching site:', error)
    return NextResponse.json({ error: 'Failed to update site' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ids = (await request.json()) as number[]
    await prisma.site.deleteMany({
      where: { id: { in: ids } },
    })

    revalidateTag('index')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting site:', error)
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 })
  }
}
