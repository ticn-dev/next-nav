'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { useEffect, useRef, useState } from 'react'
import { ImageMode, Site } from '@/types/site'
import { Category } from '@/types/category'
import { CircleHelp, ImageDown, Link, Loader2, Upload, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import NumberInput from '@/components/next-nav/common/number-input'
import { useDebouncedCallback } from 'use-debounce'
import FaviconImage from '@/components/next-nav/common/favicon-image'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { newCategory, newSite, updateSites } from '@/lib/api'

interface SiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  site: Site | null
  categories: Category[]
  onCategoryCreate: (categories: Category) => void
  onSave: (site: Site) => void
}

export function SiteDialog({ open, onOpenChange, site, categories, onCategoryCreate, onSave }: SiteDialogProps) {
  const [displayName, setDisplayName] = useState('')
  const [url, setUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [previewSetImageUrl, setPreviewSetImageUrl] = useState('')
  const [storedImageUrl, setStoredImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [useNewCategory, setUseNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [order, setOrder] = useState(0)
  const [hided, setHided] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Image upload states
  const [imageTab, setImageTab] = useState<ImageMode>('auto-fetch')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUploadUrl, setPreviewUploadUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (site) {
      setDisplayName(site.displayName)
      setUrl(site.url)
      setImageUrl(site.imageUrl || '')
      setDescription(site.description || '')
      setCategoryId(site.categoryId.toString())
      setOrder(site.order)
      setStoredImageUrl(`/api/icon/${site.id}`)
      setImageTab(site.imageMode)
      setHided(site.hided)
      // Set preview if site has an image
      if (site.imageUrl) {
        setPreviewUploadUrl(site.imageUrl)
      } else {
        setPreviewUploadUrl(null)
      }
    } else {
      setDisplayName('')
      setUrl('')
      setImageUrl('')
      setDescription('')
      setCategoryId(categories.length > 0 ? categories[0].id.toString() : '')
      setOrder(0)
      setPreviewUploadUrl(null)
      setImageTab('auto-fetch')
      setStoredImageUrl('')
      setHided(false)
    }
    setSelectedFile(null)
    setErrors({})
  }, [site, categories, open])

  const setPreviewSetImageUrlDebounced = useDebouncedCallback((imageUrl) => {
    setPreviewSetImageUrl(imageUrl)
  }, 200)

  useEffect(() => {
    setPreviewSetImageUrlDebounced(imageUrl)
  }, [imageUrl, setPreviewSetImageUrlDebounced])

  useEffect(() => {
    const newError = structuredClone(errors)
    delete newError['imageUrl']
    setErrors(newError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageTab])

  // Clean up object URLs when component unmounts or when a new file is selected
  useEffect(() => {
    return () => {
      if (previewUploadUrl && !previewUploadUrl.startsWith('http') && !previewUploadUrl.startsWith('/')) {
        URL.revokeObjectURL(previewUploadUrl)
      }
    }
  }, [previewUploadUrl])

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
    if (previewUploadUrl && !previewUploadUrl.startsWith('http') && !previewUploadUrl.startsWith('/')) {
      URL.revokeObjectURL(previewUploadUrl)
    }

    setSelectedFile(file)
    setPreviewUploadUrl(URL.createObjectURL(file))
  }

  const clearImage = () => {
    if (previewUploadUrl && !previewUploadUrl.startsWith('http') && !previewUploadUrl.startsWith('/')) {
      URL.revokeObjectURL(previewUploadUrl)
    }
    setSelectedFile(null)
    setPreviewUploadUrl(null)
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

    if (!displayName.trim()) {
      newErrors.title = '名称不能为空'
    } else if (displayName.length > 20) {
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

    if (imageTab === 'url') {
      const url = imageUrl.trim()
      if (!url) {
        newErrors.imageUrl = '图标URL不能为空'
      }
      try {
        const iu = new URL(url)
        if (!['http:', 'https:'].includes(iu.protocol)) {
          newErrors.imageUrl = '图标URL只支持http和https协议'
        }
      } catch {
        newErrors.imageUrl = '图标URL格式不正确'
      }
    } else if (imageTab === 'upload') {
      if (!site && !selectedFile) {
        newErrors.imageUrl = '请上传图标'
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

    if (isNaN(order) || order < -99999 || order > 99999) {
      newErrors.order = '排序必须是-99999到99999之间的数字'
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
        const category = await newCategory({ displayName: newCategoryName })

        categoryIdStr = category.id.toString()
        onCategoryCreate(category)
        setCategoryId(categoryIdStr)
        setUseNewCategory(false)
        setNewCategoryName('')
      }

      const requestBody = {
        displayName,
        url,
        imageUrl: imageUrl || null,
        imageMode: imageTab,
        description: description || null,
        categoryId: Number.parseInt(categoryIdStr),
        order,
        hided,
      }

      let savedSite: Site
      if (site) {
        savedSite = (await updateSites(site.id, requestBody))[0]
      } else {
        savedSite = await newSite(requestBody, selectedFile ?? undefined)
      }

      onSave(savedSite)
      toast({
        title: site ? '更新成功' : '添加成功',
        description: site ? '站点已更新' : '站点已添加',
      })
      onOpenChange(false)
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
              <Input id="title" maxLength={20} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="站点名称" className={errors.title ? 'border-destructive' : ''} />
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
              <Tabs value={imageTab} onValueChange={(v) => setImageTab(v as 'url' | 'auto-fetch' | 'upload')} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="auto-fetch" className="flex items-center gap-1">
                    <ImageDown className="h-4 w-4" />
                    <span>自动获取</span>
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-1">
                    <Upload className="h-4 w-4" />
                    <span>上传</span>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-1">
                    <Link className="h-4 w-4" />
                    <span>URL</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-3">
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/favicon.ico" />
                  {errors.imageUrl && <p className="text-destructive text-xs">{errors.imageUrl}</p>}
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
                  {errors.imageUrl && <p className="text-destructive text-xs">{errors.imageUrl}</p>}
                </TabsContent>
              </Tabs>

              {/* Image preview */}
              {imageTab === 'url' && (
                <div className="bg-muted/30 relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md border">
                  <FaviconImage alt="图标预览" src={previewSetImageUrl || storedImageUrl} fill={true} className="object-contain" loading="lazy" />
                </div>
              )}
              {imageTab === 'upload' && (
                <div className="bg-muted/30 relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md border">
                  <Image src={previewUploadUrl || storedImageUrl} alt="图标预览" fill={true} className="object-contain" />
                  <Button type="button" variant="ghost" size="icon" className="bg-background/80 hover:bg-background absolute top-1 right-1 h-6 w-6 rounded-full" onClick={clearImage}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">清除图片</span>
                  </Button>
                </div>
              )}
              {/*{(previewUploadUrl || imageUrl || storedImageUrl) && (*/}
              {/*  <div className="bg-muted/30 relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md border">*/}
              {/*    <Image src={previewUploadUrl || imageUrl || storedImageUrl} alt="图标预览" fill={true} className="object-contain" />*/}
              {/*    <Button type="button" variant="ghost" size="icon" className="bg-background/80 hover:bg-background absolute top-1 right-1 h-6 w-6 rounded-full" onClick={clearImage}>*/}
              {/*      <X className="h-4 w-4" />*/}
              {/*      <span className="sr-only">清除图片</span>*/}
              {/*    </Button>*/}
              {/*  </div>*/}
              {/*)}*/}
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
                  maxLength={20}
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
                        {category.displayName}
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
              <NumberInput
                id="order"
                min={-99999}
                max={99999}
                value={order}
                onValueChange={(v) => setOrder(v ?? 0)}
                defaultValue={0}
                placeholder="0"
                className={errors.order ? 'border-destructive' : ''}
              ></NumberInput>
              {errors.order && <p className="text-destructive text-xs">{errors.order}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hided" className="text-right">
              隐藏
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground">
                      <CircleHelp className="inline h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>并不能真正地隐藏</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="col-span-3 space-y-1">
              <Checkbox id="hided" checked={hided} onCheckedChange={(e) => setHided(e as boolean)}></Checkbox>
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              描述
            </Label>
            <div className="col-span-3 space-y-1">
              <Textarea
                id="description"
                maxLength={100}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="站点描述"
                className={errors.description ? 'border-destructive' : ''}
              />
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
