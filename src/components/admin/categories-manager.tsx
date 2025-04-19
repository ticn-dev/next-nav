"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Edit, Plus, RefreshCw, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { CategoryDialog } from "./category-dialog"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"

interface Category {
  id: number
  name: string
  order: number
}

interface CategoriesManagerProps {
  initialCategories: Category[]
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(initialCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(Math.ceil(initialCategories.length / pageSize))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Filter and paginate categories
  useEffect(() => {
    let result = [...categories]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((category) => category.name.toLowerCase().includes(term))
    }

    setTotalPages(Math.ceil(result.length / pageSize))
    setFilteredCategories(result)

    // Reset to first page when filters change
    setCurrentPage(1)
  }, [categories, searchTerm, pageSize])

  const paginatedCategories = filteredCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const refreshCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        toast({
          title: "刷新成功",
          description: "分类数据已更新",
        })
      } else {
        throw new Error("Failed to refresh categories")
      }
    } catch (error) {
      toast({
        title: "刷新失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCategories(categories.filter((category) => category.id !== categoryToDelete.id))
        toast({
          title: "删除成功",
          description: `分类 "${categoryToDelete.name}" 已删除`,
        })
      } else {
        throw new Error("Failed to delete category")
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleSaveCategory = (savedCategory: Category) => {
    if (editingCategory) {
      // Update existing category
      setCategories(categories.map((category) => (category.id === savedCategory.id ? savedCategory : category)))
    } else {
      // Add new category
      setCategories([...categories, savedCategory])
    }
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">当前共 {filteredCategories.length} 条</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:items-center">
            <Input
              placeholder="搜索分类..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-[200px]"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={refreshCategories} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] hidden md:table-cell">ID</TableHead>
              <TableHead>名称</TableHead>
              <TableHead className="hidden sm:table-cell">排序</TableHead>
              <TableHead className="w-[100px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  没有找到分类
                </TableCell>
              </TableRow>
            ) : (
              paginatedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="hidden md:table-cell">{category.id}</TableCell>
                  <TableCell>
                    <span className="font-medium">{category.name}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{category.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">每页显示</p>
          <select
            className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number.parseInt(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <p className="text-sm text-muted-foreground">条</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            上一页
          </Button>
          <p className="text-sm">
            {currentPage} / {totalPages || 1}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            下一页
          </Button>
        </div>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="删除分类"
        description={`确定要删除分类 "${categoryToDelete?.name}" 吗？此操作不可撤销，且会删除该分类下的所有站点。`}
        onConfirm={confirmDeleteCategory}
      />
    </div>
  )
}
