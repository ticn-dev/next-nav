import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { USER_STATE_COOKIE_NAME, withUserStateResponse } from '@/lib/user-state-cookie'

function _extraHashFromCookie(ustate: string) {
  const [username, hashedPassword] = ustate.split(':', 2)
  return { username, hashedPassword }
}

export async function middleware(request: NextRequest) {
  // 确定哪些路径需要保护
  const isAdminPath = request.nextUrl.pathname.startsWith('/api/admin')

  // exclude
  const isLoginPath = request.nextUrl.pathname.startsWith('/api/admin/system/login') && request.method === 'POST'
  const isGetSettingPath = request.nextUrl.pathname.startsWith('/api/admin/system') && request.method === 'GET'
  const isLogoutPath = request.nextUrl.pathname.startsWith('/api/admin/system/logout') && request.method === 'POST'

  // dont add cookie
  const isUpdateLoginPath = request.nextUrl.pathname.startsWith('/api/admin/system/login') && request.method === 'PUT'

  // 如果不需要保护，直接放行
  if (!isAdminPath || isLoginPath || isLogoutPath || isGetSettingPath) {
    return NextResponse.next()
  }

  const ustate = request.cookies.get(USER_STATE_COOKIE_NAME)

  if (!ustate) {
    // 没有认证信息，返回401并要求认证
    return NextResponse.json({ error: 'no authorization' }, { status: 401 })
  }

  // 验证凭据
  try {
    let vk: { username: string; hashedPassword: string }

    try {
      vk = _extraHashFromCookie(ustate.value)
    } catch (error) {
      console.warn(`process cookie[${ustate.value}]`, error)
      vk = { username: '', hashedPassword: '' }
    }

    const adminAccount = await prisma.admin.findFirst()
    if (adminAccount === null) {
      return NextResponse.json({ error: '管理员账号初始化失败' }, { status: 500 })
    }

    const validUsername = adminAccount.username
    const validPassword = adminAccount.password

    if (!vk.username || !vk.hashedPassword || vk.username !== validUsername || vk.hashedPassword.toLowerCase() !== validPassword.toLowerCase()) {
      // 凭据无效，返回401
      const resp = NextResponse.json({ error: '账号或密码错误' }, { status: 401 })
      resp.cookies.delete(USER_STATE_COOKIE_NAME)
      return resp
    }

    // 认证成功，继续请求
    const resp = NextResponse.next()
    if (!isUpdateLoginPath) {
      return withUserStateResponse(resp, vk.username, vk.hashedPassword)
    }
    return resp
  } catch (error) {
    console.error('Error during authentication:', error)
    // 处理错误
    return NextResponse.json({ error: '认证处理时发生错误' }, { status: 500 })
  }
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/api/admin/:path*'],
}
