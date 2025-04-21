import { prisma } from '@/lib/prisma'
import { fetchIcon } from '@/lib/favicon'
import { type NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { submitBgTask } from '@/lib/background-task'
import { resolveIconPath } from '@/lib/path-resolver'
import { saveData } from '@/lib/uploads'
import { SiteRequest } from '@/types/requests'

export async function GET(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const site = await prisma.site.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error('Error fetching site:', error)
    return NextResponse.json({ error: 'Failed to fetch site' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const formData = await request.formData()
    let parsedRequest: SiteRequest
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

    if (!parsedRequest.title || !parsedRequest.url || !parsedRequest.categoryId) {
      return NextResponse.json({ error: 'Title, URL, and category are required' }, { status: 400 })
    }

    let useImageUrl: string | null = null
    let imageData: File | null = null

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
      if (typeof imagePart === 'string') {
        return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
      }
      imageData = imagePart
    } else if (parsedRequest.imageMode === 'auto-fetch') {
      // Do nothing, auto-fetch will be handled later
    } else {
      return NextResponse.json({ error: 'Invalid image mode' }, { status: 400 })
    }

    // Update the site
    const site = await prisma.site.update({
      where: { id },
      data: {
        title: parsedRequest.title,
        url: parsedRequest.url,
        imageUrl: useImageUrl,
        imageMode: parsedRequest.imageMode,
        description: parsedRequest.description,
        categoryId: parsedRequest.categoryId,
        order: parsedRequest.order || 0,
      },
      include: {
        category: true,
      },
    })

    if (parsedRequest.imageMode === 'upload') {
      if (imageData !== null) {
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
      }
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
    console.error('Error updating site:', error)
    return NextResponse.json({ error: 'Failed to update site' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const data = await request.json()

    // Update only the provided fields
    const site = await prisma.site.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    })

    return NextResponse.json(site)
  } catch (error) {
    console.error('Error patching site:', error)
    return NextResponse.json({ error: 'Failed to update site' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.site.delete({
      where: { id },
    })

    revalidateTag('index')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting site:', error)
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 })
  }
}
