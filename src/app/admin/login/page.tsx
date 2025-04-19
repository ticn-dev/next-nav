import { LoginSettings } from '@/components/admin/login-settings'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getAdminUser() {
  const admin = await prisma.admin.findFirst()
  return admin ? admin.username : ''
}

export const metadata = {
  title: '登录设置',
}

export default async function LoginPage() {
  const username = await getAdminUser()

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">登录设置</h1>
      <LoginSettings initialUsername={username} />
    </div>
  )
}
