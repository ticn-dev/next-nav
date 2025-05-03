'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getLoginAccount, updateLoginAccount } from '@/lib/api'

export function LoginSettings() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    getLoginAccount().then((account) => {
      setUsername(account.username)
    })
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!username.trim()) {
      newErrors.username = '用户名不能为空'
    } else if (username.length < 3) {
      newErrors.username = '用户名至少需要3个字符'
    }

    if (!password) {
      newErrors.password = '密码不能为空'
    } else if (password.length < 5) {
      newErrors.password = '密码至少需要5个字符'
    } else if (password.includes(' ')) {
      newErrors.password = '密码不能包含空格'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      await updateLoginAccount(username, password)

      toast({
        title: '保存成功',
        description: '管理员账号已更新',
      })
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error saving admin account:', error)
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>管理员账号</CardTitle>
          <CardDescription>设置管理员的用户名和密码</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="管理员用户名" className={errors.username ? 'border-destructive' : ''} />
            {errors.username && <p className="text-destructive text-xs">{errors.username}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              />
              <div className="absolute top-0 right-0 flex h-full cursor-pointer items-center pr-3" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </div>
            </div>
            {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
              />
              <div className="absolute top-0 right-0 flex h-full cursor-pointer items-center pr-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </div>
            </div>
            {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword}</p>}
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="mt-4">
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
