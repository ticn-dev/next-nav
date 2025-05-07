import { type NextRequest, NextResponse } from 'next/server'
import { updateSystemSetting } from '@/lib/settings'
import { generateKey } from '@/lib/aes/node'
import { revalidateTag } from 'next/cache'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    const key = generateKey()
    await updateSystemSetting('aesKey', key)

    revalidateTag('index')

    return NextResponse.json({ success: true, hak: key })
  } catch (error) {
    console.error('Error updating aes-key:', error)
    return NextResponse.json({ error: 'Failed to update aes-key' }, { status: 500 })
  }
}
