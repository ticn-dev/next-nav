'use client'

import { TableCell, TableHead } from '@/components/ui/table'
import React, { useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Category, CategoryWithSiteIds } from '@/types/category'
import { AdminManagerTable, AdminManagerTableRefs, SearchTermMatchProvider } from '@/components/admin/admin-manager-table'
import { CategoryDialog } from '@/components/admin/category-dialog'
import { toast } from '@/components/ui/use-toast'
import { deleteCategories, getCategories } from '@/lib/api'

type CategoryTermSearcherProvider = SearchTermMatchProvider<CategoryWithSiteIds>

const defaultCategoryTermSearcher: CategoryTermSearcherProvider = {
  matchSearch(category: CategoryWithSiteIds, term: string) {
    if (category.displayName.toLowerCase().includes(term)) {
      return true
    }
    return false
  },
}

export function CategoriesManagerTable() {
  const canMatchSearchTerm = useRef<CategoryTermSearcherProvider>(defaultCategoryTermSearcher)
  const managerRef = useRef<AdminManagerTableRefs<CategoryWithSiteIds>>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithSiteIds | null>(null)

  const handlerRequestRefresh = async () => {
    return await getCategories()
  }

  const handlerTableHeaderRenderer = () => {
    return (
      <>
        <TableHead>名称</TableHead>
        <TableHead className="hidden lg:table-cell">站点数</TableHead>
        <TableHead className="hidden sm:table-cell">排序</TableHead>
      </>
    )
  }

  const handlerTableRowRenderer = (category: CategoryWithSiteIds) => {
    return (
      <>
        <TableCell>
          <span className="font-medium">{category.displayName}</span>
          {category.id === -1 && <Badge className="ml-2 bg-blue-400">默认</Badge>}
        </TableCell>
        <TableCell className="hidden lg:table-cell">{category.sites.length}</TableCell>
        <TableCell className="hidden sm:table-cell">{category.order}</TableCell>
      </>
    )
  }

  const handlerConfirmBatchDelete = async (idOrIdArray: number | number[]) => {
    await deleteCategories(idOrIdArray)
  }

  const handleSaveCategory = (newCategory: Category) => {
    managerRef.current?.setItems((oldCategories) => {
      const newArray: CategoryWithSiteIds[] = [...oldCategories]
      if (editingCategory) {
        const oldIndex = oldCategories.findIndex((category) => category.id === editingCategory.id)
        if (oldIndex === -1) {
          toast({
            title: '错误',
            description: '编辑的分类不存在',
            variant: 'destructive',
          })
          return newArray
        }
        const oldCategory = oldCategories[oldIndex]
        newArray[oldIndex] = { ...oldCategory, ...newCategory }
        // Update existing category
      } else {
        ;(newCategory as CategoryWithSiteIds).sites = []
        newArray.push(newCategory as CategoryWithSiteIds)
      }
      return newArray
    })
    setDialogOpen(false)
  }

  const handleRequestAddCategory = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }
  const handleRequestEditCategory = (category: CategoryWithSiteIds) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  return (
    <>
      <AdminManagerTable
        onRequestRefresh={handlerRequestRefresh}
        showName="分类"
        tableHeaderRenderer={handlerTableHeaderRenderer}
        tableHeadersCount={3}
        tableRowRenderer={handlerTableRowRenderer}
        canMatchSearchTerm={canMatchSearchTerm.current}
        onConfirmBatchDelete={handlerConfirmBatchDelete}
        onRequestEdit={handleRequestEditCategory}
        onRequestAdd={handleRequestAddCategory}
        ref={managerRef}
      />

      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editingCategory} onSave={handleSaveCategory} />
    </>
  )
}
