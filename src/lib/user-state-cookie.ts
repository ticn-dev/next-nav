import { NextResponse } from 'next/server'

export const USER_STATE_COOKIE_NAME = '_ustate'

export function withUserStateResponse(response: NextResponse, username: string, hashedPassword: string) {
  const cookieValue = `${username}:${hashedPassword}`
  response.cookies.set(USER_STATE_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    path: '/api/admin',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return response
}
