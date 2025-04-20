import { type NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { deleteData, saveData } from '@/lib/uploads'
import { resolveIconPath, SystemIconId } from '@/lib/path-resolver'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('favicon') as File | null

    const iconPath = resolveIconPath(SystemIconId)

    if (!file) {
      await deleteData(iconPath)
      revalidateTag('index')
      return NextResponse.json({ faviconUrl: null })
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // base64 of favicon
    const fileExt = file.name.split('.').pop()
    await saveData(iconPath, await file.bytes(), { 'content-type': file.type, 'file-ext': fileExt })

    return NextResponse.json({ faviconUrl: '/api/icon/this' })
  } catch (error) {
    console.error('Error uploading favicon:', error)
    return NextResponse.json({ error: 'Failed to upload favicon' }, { status: 500 })
  }
}
