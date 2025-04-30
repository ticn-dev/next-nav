'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { MetadataEditor } from './metadata-editor'
import { FaviconUploader } from './favicon-uploader'
import { toast } from '@/components/ui/use-toast'
import { SystemDataBackup } from './system-data-backup'
import { updateSiteSettings } from '@/lib/api'
import { MetaData } from '@/types/metadata'
import { Switch } from '@/components/ui/switch'
import { useAdminSettings } from '@/components/next-nav/context/admin-settings-provider'

export function SystemSettings() {
  const { settings, updateSettings } = useAdminSettings()
  const [title, setTitle] = useState(settings.title)
  const [copyright, setCopyright] = useState(settings.copyright)
  const [showGithubButton, setShowGithubButton] = useState(settings.showGithubButton)
  const [metadata, setMetadata] = useState<MetaData[]>(settings.metadata)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setTitle(settings.title)
    setCopyright(settings.copyright)
    setShowGithubButton(settings.showGithubButton)
    setMetadata(settings.metadata)
  }, [settings])

  const handleSaveSiteSettings = async () => {
    setIsSaving(true)
    try {
      await updateSiteSettings({ title, copyright, showGithubButton })

      updateSettings({ title, copyright, showGithubButton })

      toast({
        title: '保存成功',
        description: '网站设置已更新',
      })
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="title">站点设置</TabsTrigger>
          <TabsTrigger value="metadata">元数据设置</TabsTrigger>
          <TabsTrigger value="favicon">图标设置</TabsTrigger>
          <TabsTrigger value="backup">数据操作</TabsTrigger>
        </TabsList>
        <TabsContent value="title">
          <Card>
            <CardHeader>
              <CardTitle>站点设置</CardTitle>
              <CardDescription>设置网站的一些普通配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <span>站点名称</span>
                <Label className="text-muted-foreground text-sm" htmlFor="title">
                  直接展示在网页标签栏上的名称
                </Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Next Nav" />
              </div>
              <div className="space-y-2">
                <span>版权信息</span>
                <Label className="text-muted-foreground text-sm" htmlFor="copyright">
                  直接展示在网页底部的版权信息
                </Label>
                <Input id="copyright" value={copyright} onChange={(e) => setCopyright(e.target.value)} placeholder="Kairlec-NextNav" />
              </div>
              <div className="space-y-2">
                <span>显示Github图标</span>
                <div>
                  <Label className="text-muted-foreground mb-1 text-sm" htmlFor="showGithubButton">
                    顶栏菜单上的按钮
                  </Label>
                  <Switch id="showGithubButton" checked={showGithubButton} onCheckedChange={(e) => setShowGithubButton(e)} />
                </div>
              </div>
              <Button onClick={handleSaveSiteSettings} disabled={isSaving}>
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="metadata">
          <MetadataEditor initialMetadata={metadata} onUpdate={setMetadata} />
        </TabsContent>
        <TabsContent value="favicon">
          <FaviconUploader initialFavicon="/api/icon/this" onUpdate={(url) => updateSettings({ iconUrl: url })} />
        </TabsContent>
        <TabsContent value="backup">
          <SystemDataBackup></SystemDataBackup>
        </TabsContent>
      </Tabs>
    </div>
  )
}
