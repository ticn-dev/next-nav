'use client'

import React, { useEffect, useState } from 'react'
import { login, testLoginValid } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import Form from 'next/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAdminSettings } from '@/components/next-nav/context/admin-settings-provider'
import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/next-nav/admin/admin-header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Footer } from '@/components/next-nav/common/footer'

export function AdminMainComponent({ children }: { children: React.ReactNode }) {
  const { settings } = useAdminSettings()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handlerExitRequest = () => {
    router.push('/')
  }

  // Login state
  const [needLogin, setNeedLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState(false)
  const [loginErrorMessage, setLoginErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testLoginValid()
      .then((value) => {
        setNeedLogin(!value)
      })
      .catch(() => {
        setNeedLogin(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleLoginRequest = async () => {
    if (!username) {
      setLoginError(true)
      setLoginErrorMessage('用户名不能为空')
      return
    }
    if (!password) {
      setLoginError(true)
      setLoginErrorMessage('密码不能为空')
      return
    }
    try {
      const result = await login(username, password)
      if (result === true) {
        setLoginError(false)
        setNeedLogin(false)
        setUsername('')
        setPassword('')
      } else {
        setLoginError(true)
        setLoginErrorMessage(result)
      }
    } catch (err) {
      console.error('Login failed', err)
      setLoginError(true)
      setLoginErrorMessage(`登录失败, ${err?.toString() ?? '请稍后再试'}`)
      return
    }
  }

  return (
    <>
      {loading && (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          处理中...
        </div>
      )}

      {!loading && !needLogin && (
        <div className="bg-background flex max-h-full min-h-screen flex-col">
          <AdminHeader
            showGithubButton={settings.showGithubButton}
            onExitRequest={handlerExitRequest}
            onToggleMobileMenuAction={() => {
              setOpen(!open)
            }}
          />
          <div className="flex h-full min-h-0 flex-1 items-stretch">
            <AdminSidebar className="hidden md:block" open={open} onOpenChange={setOpen} />
            <main className="flex flex-1 flex-col overflow-hidden p-6">
              <div className="max-h-full overflow-auto">{children}</div>
            </main>
          </div>
          {settings.copyright && <Footer copyright={settings.copyright} />}
        </div>
      )}

      {!loading && needLogin && (
        <div className="bg-background flex max-h-full min-h-screen flex-col">
          <AdminHeader
            showGithubButton={settings.showGithubButton}
            onExitRequest={handlerExitRequest}
            onToggleMobileMenuAction={() => {
              setOpen(!open)
            }}
          />
          <div className="flex h-full min-h-0 flex-1 items-stretch">
            <main className="flex flex-1 flex-col overflow-hidden p-6">
              <Form className="flex h-screen items-center justify-center" action={handleLoginRequest}>
                <div className="bg-card w-full max-w-sm space-y-4 rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-bold">登录</h2>
                  <div>
                    <Label htmlFor="username" className="block font-medium text-gray-700 dark:text-gray-300">
                      用户名
                    </Label>
                    <Input
                      type="text"
                      id="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`mt-1 block w-full shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="block font-medium text-gray-700 dark:text-gray-300">
                      密码
                    </Label>
                    <Input
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`mt-1 block w-full shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                    />
                  </div>
                  {loginError && <p className="text-red-500">{loginErrorMessage}</p>}
                  <Button
                    type="submit"
                    className={`w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 focus:ring focus:ring-blue-300 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600`}
                    disabled={loading}
                  >
                    登录
                  </Button>
                </div>
              </Form>
            </main>
          </div>
          {settings.copyright && <Footer copyright={settings.copyright} />}
        </div>
      )}
    </>
  )
}
