import { type NextRequest, NextResponse } from 'next/server'
import { USER_STATE_COOKIE_NAME } from '@/lib/user-state-cookie'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    const resp = new NextResponse(null, { status: 204 })
    resp.cookies.delete(USER_STATE_COOKIE_NAME)
    return resp
  } catch (error) {
    console.error('Error deleting cookie:', error)
    return NextResponse.json({ error: 'Failed to delete cookie' }, { status: 500 })
  }
}
