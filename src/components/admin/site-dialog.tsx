"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"

interface Category {
  id: number
  name: string
  order: number
}

interface Site {
  id: number
  title: string
  description: string | null
  url: string
  imageUrl: string | null
  order: number
  categoryId: number
  category: Category
}

interface SiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  site: Site | null
  categories: Category[]
  onSave: (site: Site) => void
}

export function SiteDialog({ open, onOpenChange, site, categories, onSave }: SiteDialogProps) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [order, setOrder] = useState("0")
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (site) {
      setTitle(site.title)
      setUrl(site.url)
      setImageUrl(site.imageUrl || "")
      setDescription(site.description || "")
      setCategoryId(site.categoryId.toString())
      setOrder(site.order.toString())
    } else {
      setTitle("")
      setUrl("")
      setImageUrl("")
      setDescription("")
      setCategoryId(categories.length > 0 ? categories[0].id.toString() : "")
      setOrder("0")
    }
    setErrors({})
  }, [site, categories, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "名称不能为空"
    } else if (title.length > 20) {
      newErrors.title = "名称不能超过20个字符"
    }

    if (!url.trim()) {
      newErrors.url = "URL不能为空"
    }

    if (!categoryId) {
      newErrors.categoryId = "请选择分类"
    }

    if (!order.trim()) {
      newErrors.order = "排序不能为空"
    } else {
      const orderNum = Number.parseInt(order)
      if (isNaN(orderNum) || orderNum < -99999 || orderNum > 99999) {
        newErrors.order = "排序必须是-99999到99999之间的数字"
      }
    }

    if (description && description.length > 100) {
      newErrors.description = "描述不能超过100个字符"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const method = site ? "PUT" : "POST"
      const endpoint = site ? `/api/admin/sites/${site.id}` : "/api/admin/sites"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          url,
          imageUrl: imageUrl || null,
          description: description || null,
          categoryId: Number.parseInt(categoryId),
          order: Number.parseInt(order),
        }),
      })

      if (response.ok) {
        const savedSite = await response.json()
        onSave(savedSite)
        toast({
          title: site ? "更新成功" : "添加成功",
          description: site ? "站点已更新" : "站点已添加",
        })
        onOpenChange(false)
      } else {
        throw new Error(site ? "Failed to update site" : "Failed to add site")
      }
    } catch (error) {
      toast({
        title: site ? "更新失败" : "添加失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{site ? "编辑站点" : "添加站点"}</DialogTitle>
          <DialogDescription>{site ? "修改站点信息" : "添加新的站点到导航页"}</DialogDescription>
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
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="站点名称"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL *
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className={errors.url ? "border-destructive" : ""}
              />
              {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">
              图标URL
            </Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/favicon.ico"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              分类 *
            </Label>
            <div className="col-span-3 space-y-1">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className={errors.categoryId ? "border-destructive" : ""}>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right">
              排序 *
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="order"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0"
                className={errors.order ? "border-destructive" : ""}
              />
              {errors.order && <p className="text-xs text-destructive">{errors.order}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              描述
            </Label>
            <div className="col-span-3 space-y-1">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="站点描述"
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
