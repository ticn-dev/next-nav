import { prisma } from '@/lib/prisma'
import { fetchIcon } from '@/lib/favicon'
import { type NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { submitBgTask } from '@/lib/background-task'
import { resolveIconPath } from '@/lib/path-resolver'
import { saveData } from '@/lib/uploads'

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

    const { title, url, imageUrl, description, categoryId, order } = await request.json()

    if (!title || !url || !categoryId) {
      return NextResponse.json({ error: 'Title, URL, and category are required' }, { status: 400 })
    }

    // Update the site
    const site = await prisma.site.update({
      where: { id },
      data: {
        title,
        url,
        imageUrl,
        description,
        categoryId,
        order: order || 0,
      },
      include: {
        category: true,
      },
    })

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

    revalidateTag('index')

    return NextResponse.json(site)
  } catch (error) {
    console.error('Error updating site:', error)
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
