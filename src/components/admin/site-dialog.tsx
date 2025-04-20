'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { useEffect, useRef, useState } from 'react'
import { Site } from '@/types/site'
import { Category } from '@/types/category'
import { Link, Loader2, Upload, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'

interface SiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  site: Site | null
  categories: Category[]
  onCategoryCreate: (categories: Category) => void
  onSave: (site: Site) => void
}

export function SiteDialog({ open, onOpenChange, site, categories, onCategoryCreate, onSave }: SiteDialogProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [storedImageUrl, setStoredImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [useNewCategory, setUseNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [order, setOrder] = useState('0')
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Image upload states
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('url')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (site) {
      setTitle(site.title)
      setUrl(site.url)
      setImageUrl(site.imageUrl || '')
      setDescription(site.description || '')
      setCategoryId(site.categoryId.toString())
      setOrder(site.order.toString())
      setStoredImageUrl(`/api/icon/${site.id}`)
      // Set preview if site has an image
      if (site.imageUrl) {
        setPreviewUrl(site.imageUrl)
        setImageTab('url')
      } else {
        setPreviewUrl(null)
        setImageTab('url')
      }
    } else {
      setTitle('')
      setUrl('')
      setImageUrl('')
      setDescription('')
      setCategoryId(categories.length > 0 ? categories[0].id.toString() : '')
      setOrder('0')
      setPreviewUrl(null)
      setImageTab('url')
      setStoredImageUrl('')
    }
    setSelectedFile(null)
    setErrors({})
  }, [site, categories, open])

  // Clean up object URLs when component unmounts or when a new file is selected
  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith('http') && !previewUrl.startsWith('/')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      toast({
        title: '不支持的文件类型',
        description: '请上传PNG、JPEG、GIF、WebP或SVG格式的图片',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '图片文件不能超过2MB',
        variant: 'destructive',
      })
      return
    }

    // Create preview
    if (previewUrl && !previewUrl.startsWith('http') && !previewUrl.startsWith('/')) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const clearImage = () => {
    if (previewUrl && !previewUrl.startsWith('http') && !previewUrl.startsWith('/')) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setImageUrl('')
  }

  const handleCategoryChange = (value: string) => {
    if (value === '#new') {
      setUseNewCategory(true)
      setCategoryId('')
    } else {
      setUseNewCategory(false)
      setCategoryId(value)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = '名称不能为空'
    } else if (title.length > 20) {
      newErrors.title = '名称不能超过20个字符'
    }

    if (!url.trim()) {
      newErrors.url = 'URL不能为空'
    } else {
      try {
        new URL(url)
      } catch {
        newErrors.url = 'URL格式不正确'
      }
    }

    if (imageUrl) {
      try {
        const iu = new URL(imageUrl)
        if (!['http:', 'https:'].includes(iu.protocol)) {
          newErrors.imageUrl = '图标URL只支持http和https协议'
        }
      } catch {
        newErrors.imageUrl = '图标URL格式不正确'
      }
    }

    if (useNewCategory) {
      if (!newCategoryName.trim()) {
        newErrors.categoryId = '新分类名称不能为空'
      } else if (newCategoryName.length > 20) {
        newErrors.categoryId = '新分类名称不能超过20个字符'
      }
    } else {
      if (!categoryId) {
        newErrors.categoryId = '请选择分类'
      }
    }

    if (!order.trim()) {
      newErrors.order = '排序不能为空'
    } else {
      const orderNum = Number.parseInt(order)
      if (isNaN(orderNum) || orderNum < -99999 || orderNum > 99999) {
        newErrors.order = '排序必须是-99999到99999之间的数字'
      }
    }

    if (description && description.length > 100) {
      newErrors.description = '描述不能超过100个字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      let categoryIdStr = categoryId
      if (useNewCategory) {
        const newCategoryResponse = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newCategoryName,
            order: 0,
          }),
        })

        if (newCategoryResponse.ok) {
          const newCategory = await newCategoryResponse.json()
          categoryIdStr = newCategory.id.toString()
          onCategoryCreate(newCategory)
          setCategoryId(categoryIdStr)
          setUseNewCategory(false)
          setNewCategoryName('')
        } else {
          throw new Error('Failed to create new category')
        }
      }
      let imageData: string | undefined
      let imageFilename: string | undefined
      if (imageTab === 'upload' && selectedFile) {
        // base64 encode the image
        const reader = new FileReader()
        reader.readAsDataURL(selectedFile)
        reader.onload = () => {
          imageData = reader.result as string
        }
        await new Promise((resolve) => {
          reader.onloadend = () => {
            resolve(null)
          }
        })
        imageFilename = selectedFile.name
        console.log('imageData', imageData)
        console.log('imageFilename', imageFilename)
      }
      const method = site ? 'PUT' : 'POST'
      const endpoint = site ? `/api/admin/sites/${site.id}` : '/api/admin/sites'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          url,
          imageUrl: imageUrl || null,
          imageData,
          imageFilename,
          description: description || null,
          categoryId: Number.parseInt(categoryIdStr),
          order: Number.parseInt(order),
        }),
      })

      if (response.ok) {
        const savedSite = await response.json()
        onSave(savedSite)
        toast({
          title: site ? '更新成功' : '添加成功',
          description: site ? '站点已更新' : '站点已添加',
        })
        onOpenChange(false)
      } else {
        throw new Error(site ? 'Failed to update site' : 'Failed to add site')
      }
    } catch (error) {
      console.error('Error saving site:', error)
      toast({
        title: site ? '更新失败' : '添加失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{site ? '编辑站点' : '添加站点'}</DialogTitle>
          <DialogDescription>{site ? '修改站点信息' : '添加新的站点到导航页'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {site && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">
                ID
              </Label>
              <Input id="id" value={site.id} className="col-span-3" disabled />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              名称 *
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="站点名称" className={errors.title ? 'border-destructive' : ''} />
              {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL *
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="schema://hostname" className={errors.url ? 'border-destructive' : ''} />
              {errors.url && <p className="text-destructive text-xs">{errors.url}</p>}
            </div>
          </div>

          {/* Image section with tabs */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="pt-2 text-right">图标</Label>
            <div className="col-span-3 space-y-3">
              <Tabs value={imageTab} onValueChange={(v) => setImageTab(v as 'url' | 'upload')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="flex items-center gap-1">
                    <Link className="h-4 w-4" />
                    <span>URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-1">
                    <Upload className="h-4 w-4" />
                    <span>上传</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-3">
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/favicon.ico" />
                </TabsContent>

                <TabsContent value="upload" className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          上传中...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          选择图片
                        </>
                      )}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/png,image/jpeg,image/gif,image/webp,image/x-icon,image/vnd.microsoft.icon"
                      onChange={handleFileChange}
                      disabled={isSaving}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">支持PNG、JPEG、GIF、WebP和ICO格式，最大2MB</p>
                </TabsContent>
              </Tabs>

              {/* Image preview */}
              {(previewUrl || imageUrl || storedImageUrl) && (
                <div className="bg-muted/30 relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md border">
                  <Image src={previewUrl || imageUrl || storedImageUrl} alt="图标预览" fill={true} className="object-contain" />
                  <Button type="button" variant="ghost" size="icon" className="bg-background/80 hover:bg-background absolute top-1 right-1 h-6 w-6 rounded-full" onClick={clearImage}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">清除图片</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              分类 *
            </Label>
            <div className="col-span-3 space-y-1">
              {useNewCategory ? (
                <Input
                  id="newCategory"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="新分类名称"
                  className={errors.categoryId ? 'border-destructive' : ''}
                />
              ) : (
                <Select value={categoryId} onValueChange={handleCategoryChange}>
                  <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="#new" className="text-purple-500 focus:text-purple-500">
                      新建分类
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              {errors.categoryId && <p className="text-destructive text-xs">{errors.categoryId}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right">
              排序 *
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="order" value={order} onChange={(e) => setOrder(e.target.value)} placeholder="0" className={errors.order ? 'border-destructive' : ''} />
              {errors.order && <p className="text-destructive text-xs">{errors.order}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              描述
            </Label>
            <div className="col-span-3 space-y-1">
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="站点描述" className={errors.description ? 'border-destructive' : ''} />
              {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            关闭
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              '保存'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
