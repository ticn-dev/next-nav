import { LoginSettings } from '@/components/admin/login-settings'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '登录设置',
}

export default async function LoginPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">登录设置</h1>
      <LoginSettings />
    </div>
  )
}
