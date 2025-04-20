'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useEffect, useState } from 'react'
import { Category } from '@/types/category'
import NumberInput from '@/components/number-input'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  onSave: (category: Category) => void
}

export function CategoryDialog({ open, onOpenChange, category, onSave }: CategoryDialogProps) {
  const [name, setName] = useState('')
  const [order, setOrder] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (category) {
      setName(category.name)
      setOrder(category.order)
    } else {
      setName('')
      setOrder(0)
    }
    setErrors({})
  }, [category, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = '名称不能为空'
    }

    if (isNaN(order) || order < -99999 || order > 99999) {
      newErrors.order = '排序必须是-99999到99999之间的数字'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const method = category ? 'PUT' : 'POST'
      const endpoint = category ? `/api/admin/categories/${category.id}` : '/api/admin/categories'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          order,
        }),
      })

      if (response.ok) {
        const savedCategory = await response.json()
        onSave(savedCategory)
        toast({
          title: category ? '更新成功' : '添加成功',
          description: category ? '分类已更新' : '分类已添加',
        })
        onOpenChange(false)
      } else {
        throw new Error(category ? 'Failed to update category' : 'Failed to add category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast({
        title: category ? '更新失败' : '添加失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{category ? '编辑分类' : '添加分类'}</DialogTitle>
          <DialogDescription>{category ? '修改分类信息' : '添加新的分类到导航页'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {category && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">
                ID
              </Label>
              <Input id="id" value={category.id} className="col-span-3" disabled />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              名称 *
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="name" maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="分类名称" className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
