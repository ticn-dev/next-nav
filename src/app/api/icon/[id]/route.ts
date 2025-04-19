import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'
import { resolveIconPath, SystemIconId } from '@/lib/path-resolver'
import { readData } from '@/lib/uploads'

async function _responseIconData(id: string | number) {
  const systemIcon = resolveIconPath(id)
  const iconData = await readData(systemIcon)
  if (iconData == null) {
    return new NextResponse(null, { status: 404 })
  }
  const contentType = iconData.metadata['content-type'] as string
  const fileExt = iconData.metadata['file-ext'] as string
  return new NextResponse(iconData.data, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'x-favicon-type': fileExt,
    },
  })
}

export async function GET(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    if (params.id === 'this' || params.id.startsWith('this.')) {
      return _responseIconData(SystemIconId)
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return new NextResponse(null, { status: 400 })
    }

    const site = await prisma.site.findUnique({
      where: { id },
      select: { imageUrl: true },
    })

    if (!site) {
      return new NextResponse(null, { status: 404 })
    }

    // If we have an image URL, redirect to it
    if (site.imageUrl) {
      return NextResponse.redirect(site.imageUrl)
    }

    return _responseIconData(id)
  } catch (error) {
    console.error('Error fetching icon:', error)
    return new NextResponse(null, { status: 500 })
  }
}
