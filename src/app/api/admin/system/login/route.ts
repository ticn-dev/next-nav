import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'
import { sha512 } from '@/lib/hash'
import crypto from 'crypto'
import { withUserStateResponse } from '@/lib/user-state-cookie'
import { getSystemSettings } from '@/lib/settings'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const admin = await prisma.admin.findFirst()
    return NextResponse.json({
      username: admin?.username ?? '',
    })
  } catch (error) {
    console.error('Error fetching admin username:', error)
    return NextResponse.json({ error: 'Failed to fetch admin username' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const adminAccount = await prisma.admin.findFirst()
    if (adminAccount === null) {
      return NextResponse.json({ error: '管理员账号初始化失败' }, { status: 500 })
    }

    const validUsername = adminAccount.username
    const validPassword = adminAccount.password

    const hashedPassword = sha512(password)
    if (username !== validUsername || hashedPassword.toLowerCase() !== validPassword.toLowerCase()) {
      return NextResponse.json({ error: '账号或密码错误' }, { status: 401 })
    }

    const { aesKey } = await getSystemSettings('aesKey')

    return withUserStateResponse(NextResponse.json({ success: true, hak: aesKey }), username, hashedPassword)
  } catch (error) {
    console.error('Error logging in:', error)
    return NextResponse.json({ error: 'Failed to log in' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    if (password.length < 5) {
      return NextResponse.json({ error: 'Password must be at least 5 characters' }, { status: 400 })
    }

    // Hash the password with SHA-512
    const hashedPassword = crypto.createHash('sha512').update(password).digest('hex')

    // Check if admin exists
    const admin = await prisma.admin.findFirst()

    if (admin) {
      // Update existing admin
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          username,
          password: hashedPassword,
        },
      })
    } else {
      // Create new admin
      await prisma.admin.create({
        data: {
          username,
          password: hashedPassword,
        },
      })
    }

    return withUserStateResponse(NextResponse.json({ success: true }), username, hashedPassword)
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function HEAD(request: NextRequest) {
  try {
    const { aesKey } = await getSystemSettings('aesKey')
    return new NextResponse(null, { status: 204, headers: { 'x-hak': aesKey } })
  } catch (error) {
    console.error('Error fetching admin username:', error)
    return NextResponse.json({ error: 'Failed to fetch admin username' }, { status: 500 })
  }
}
