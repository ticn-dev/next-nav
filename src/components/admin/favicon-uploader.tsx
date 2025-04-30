'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Globe, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { uploadSiteFavicon } from '@/lib/api'

interface FaviconUploaderProps {
  initialFavicon: string
  onUpdate?: (favicon: string) => void
}

export function FaviconUploader({ initialFavicon, onUpdate }: FaviconUploaderProps) {
  const [favicon, setFavicon] = useState(initialFavicon)
  const [isUploading, setIsUploading] = useState(false)
  const [iconError, setIconError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon']
    if (!validTypes.includes(file.type)) {
      toast({
        title: '不支持的文件类型',
        description: '请上传PNG、JPEG、GIF或ICO格式的图片',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '图标文件不能超过5MB',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    try {
      const faviconUrl = await uploadSiteFavicon(file)

      const newFaviconUrl = `${faviconUrl}?t=${Date.now()}`
      setFavicon(newFaviconUrl) // Force refresh the image
      setIconError(false) // Reset error state
      toast({
        title: '上传成功',
        description: '网站图标已更新',
      })
      onUpdate?.(newFaviconUrl)
    } catch (error) {
      console.error('Error uploading favicon:', error)
      toast({
        title: '上传失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFaviconLoadError = () => {
    setIconError(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>网站图标</CardTitle>
        <CardDescription>上传网站的图标，将显示在浏览器标签页上</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {iconError ? (
            <Globe className="h-32 w-32" />
          ) : (
            <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
              <Image src={favicon} onError={handleFaviconLoadError} alt="网站图标" fill className="object-contain" />
            </div>
          )}
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/png,image/jpeg,image/gif,image/webp,image/x-icon,image/vnd.microsoft.icon" onChange={handleFileChange} />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? '上传中...' : '上传图标'}
        </Button>
      </CardContent>
    </Card>
  )
}
