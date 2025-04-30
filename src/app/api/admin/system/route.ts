import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'
import { getSystemSettings } from '@/lib/settings'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const settings = await getSystemSettings('title', 'copyright', 'showGithubButton')
    const metadata = await prisma.metaData.findMany()

    return NextResponse.json({
      title: settings.title || 'Next Nav',
      copyright: settings.copyright,
      showGithubButton: settings.showGithubButton,
      metadata,
    })
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return NextResponse.json({ error: 'Failed to fetch system settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    let kvs: { key: string; value: string }[]
    if (Array.isArray(requestBody)) {
      kvs = requestBody
    } else {
      kvs = [requestBody]
    }
    const updates = kvs.map(({ key, value }) => {
      if (!key) {
        throw new Error('Key and value are required')
      }
      return {
        where: { key },
        update: { value },
        create: { key, value },
      }
    })
    await prisma.$transaction(updates.map((update) => prisma.systemSettings.upsert(update)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
