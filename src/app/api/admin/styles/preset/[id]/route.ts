import { applyThemePreset, deleteThemePreset } from '@/lib/style-settings'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    const presetId = params.id
    const updatedSettings = await applyThemePreset(presetId)
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Error applying theme preset:', error)
    return NextResponse.json({ error: 'Failed to apply theme preset' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    const presetId = params.id
    const updatedSettings = await deleteThemePreset(presetId)
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Error deleting theme preset:', error)
    return NextResponse.json({ error: 'Failed to delete theme preset' }, { status: 500 })
  }
}
