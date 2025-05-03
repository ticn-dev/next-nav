import { NextRequest, NextResponse } from 'next/server'
import { saveBookmarksToDatabase } from '@/lib/bookmarks-importer'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const type = body.type
    const data = body.data

    if (type === 'bookmarks') {
      await saveBookmarksToDatabase(data)
    } else {
      throw new Error('Unsupported type')
    }

    revalidateTag('index')

    return NextResponse.json({ message: 'Backup restored successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error during restore:', error)
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 })
  }
}
