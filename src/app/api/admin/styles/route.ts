import { getStyleSettings, updateStyleSettings } from '@/lib/style-settings'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()
    await updateStyleSettings(settings)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating style settings:', error)
    return NextResponse.json({ error: 'Failed to update style settings' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const settings = await getStyleSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching style settings:', error)
    return NextResponse.json({ error: 'Failed to fetch style settings' }, { status: 500 })
  }
}
