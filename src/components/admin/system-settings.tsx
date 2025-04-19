'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { MetadataEditor } from './metadata-editor'
import { FaviconUploader } from './favicon-uploader'
import { toast } from '@/components/ui/use-toast'

interface MetaData {
  id: number
  key: string
  value: string
}

interface SystemSettingsRecord {
  title: string
  copyright: string
  favicon: string
  metadata: MetaData[]
}

interface SystemSettingsProps {
  initialSettings: SystemSettingsRecord
  onInitialSettingsChange?: (settings: Partial<SystemSettingsRecord>) => void
}

export function SystemSettings({ initialSettings, onInitialSettingsChange }: SystemSettingsProps) {
  const [title, setTitle] = useState(initialSettings.title)
  const [copyright, setCopyright] = useState(initialSettings.copyright)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSiteSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          { key: 'title', value: title },
          { key: 'copyright', value: copyright },
        ]),
      })

      if (response.ok) {
        toast({
          title: '保存成功',
          description: '网站标题已更新',
        })
        onInitialSettingsChange?.({ title })
        const currentTitle = document.title
        const prefix = currentTitle.split('|', 2)[0].trim()
        document.title = `${prefix} | ${title || 'Next Nav'}`
      } else {
        throw new Error('Failed to save title')
      }
    } catch (error) {
      console.error('Error saving title:', error)
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
      <Tabs defaultValue="title" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="title">站点设置</TabsTrigger>
          <TabsTrigger value="metadata">元数据设置</TabsTrigger>
          <TabsTrigger value="favicon">图标设置</TabsTrigger>
        </TabsList>
        <TabsContent value="title">
          <Card>
            <CardHeader>
              <CardTitle>站点设置</CardTitle>
              <CardDescription>设置网站的一些普通配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">站点名称</Label>
                <span className="text-muted-foreground text-sm">直接展示在网页标签栏上的名称</span>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Next Nav" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyright">版权信息</Label>
                <span className="text-muted-foreground text-sm">直接展示在网页底部的版权信息</span>
                <Input id="copyright" value={copyright} onChange={(e) => setCopyright(e.target.value)} placeholder="Kairlec-NextNav" />
              </div>
              <Button onClick={handleSaveSiteSettings} disabled={isSaving}>
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="metadata">
          <MetadataEditor initialMetadata={initialSettings.metadata} onUpdate={(metadata) => onInitialSettingsChange?.({ metadata })} />
        </TabsContent>
        <TabsContent value="favicon">
          <FaviconUploader initialFavicon={initialSettings.favicon} onUpdate={(favicon) => onInitialSettingsChange?.({ favicon })} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
