'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Edit, Globe, Loader2, MoveHorizontal, Plus, RefreshCw, Trash, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SiteDialog } from './site-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import Image from 'next/image'
import { Site, SiteWithCategory } from '@/types/site'
import { Category } from '@/types/category'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface SitesManagerProps {
  initialSites: SiteWithCategory[]
  initialCategories: Category[]
}

interface LoadableSiteWithCategory extends SiteWithCategory {
  imageLoadError?: boolean
}

export function SitesManager({ initialSites, initialCategories }: SitesManagerProps) {
  const [sites, setSites] = useState<LoadableSiteWithCategory[]>(initialSites)
  const [filteredSites, setFilteredSites] = useState<LoadableSiteWithCategory[]>(initialSites)
  const [paginatedSites, setPaginatedSites] = useState<LoadableSiteWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(Math.ceil(initialSites.length / pageSize))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<LoadableSiteWithCategory | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState<LoadableSiteWithCategory | null>(null)

  // Batch operation states
  const [selectedChanged, setSelectedChanged] = useState<boolean | null>(null)
  const [selectedSites, setSelectedSites] = useState<Set<number>>(new Set())
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false)
  const [batchMoveDialogOpen, setBatchMoveDialogOpen] = useState(false)
  const [targetCategoryId, setTargetCategoryId] = useState<string>('')
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)

  useEffect(() => {
    if (selectedChanged === null) {
      setSelectedChanged(selectedSites.size > 0)
    } else {
      setSelectedChanged(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSites])

  // Filter and paginate sites
  useEffect(() => {
    let result = [...sites]

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter((site) => site.categoryId === Number.parseInt(categoryFilter))
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((site) => site.title.toLowerCase().includes(term) || site.url.toLowerCase().includes(term) || (site.description && site.description.toLowerCase().includes(term)))
    }

    setTotalPages(Math.ceil(result.length / pageSize))
    setFilteredSites(result)

    // Reset to first page when filters change
    setCurrentPage(1)
  }, [sites, categoryFilter, searchTerm, pageSize])

  useEffect(() => {
    setPaginatedSites(filteredSites.slice((currentPage - 1) * pageSize, currentPage * pageSize))
  }, [filteredSites, currentPage, pageSize])

  useEffect(() => {
    // Update isAllSelected based on whether all filtered items are selected
    if (selectedSites.size > 0) {
      const allFilteredSelected = paginatedSites.every((site) => selectedSites.has(site.id))
      setIsAllSelected(allFilteredSelected && paginatedSites.length > 0)
    } else {
      setIsAllSelected(false)
    }
  }, [paginatedSites, selectedSites])

  // Handle "select all" checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      // If all items on current page are selected, deselect them
      const newSelected = new Set(selectedSites)
      paginatedSites.forEach((site) => newSelected.delete(site.id))
      setSelectedSites(newSelected)
      setIsAllSelected(false)
    } else {
      // Select all items on current page
      const newSelected = new Set(selectedSites)
      paginatedSites.forEach((site) => newSelected.add(site.id))
      setSelectedSites(newSelected)
      setIsAllSelected(true)
    }
  }

  // Handle individual checkbox selection
  const handleSelectSite = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedSites)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedSites(newSelected)

    // Update "select all" state
    setIsAllSelected(newSelected.size === paginatedSites.length && newSelected.size > 0)
  }

  // Batch delete sites
  const confirmBatchDelete = async () => {
    if (selectedSites.size === 0) return

    setIsBatchProcessing(true)
    try {
      const selectedArray = Array.from(selectedSites)
      const results = await Promise.allSettled(selectedArray.map((id) => fetch(`/api/sites/${id}`, { method: 'DELETE' })))

      // Count successful deletions
      const successCount = results.filter((r) => r.status === 'fulfilled').length

      // Update sites list
      setSites(sites.filter((site) => !selectedSites.has(site.id)))
      setSelectedSites(new Set())
      setIsAllSelected(false)

      toast({
        title: '批量删除成功',
        description: `已删除 ${successCount} 个站点`,
      })
    } catch (error) {
      console.error('Error deleting sites:', error)
      toast({
        title: '批量删除失败',
        description: '部分或全部站点删除失败，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setBatchDeleteDialogOpen(false)
      setIsBatchProcessing(false)
    }
  }

  // Batch move sites to a different category
  const confirmBatchMove = async () => {
    if (selectedSites.size === 0 || !targetCategoryId) return

    setIsBatchProcessing(true)
    try {
      const selectedArray = Array.from(selectedSites)
      const categoryId = Number.parseInt(targetCategoryId)
      const results = await Promise.allSettled(
        selectedArray.map((id) =>
          fetch(`/api/sites/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryId }),
          }),
        ),
      )

      // Count successful moves
      const successCount = results.filter((r) => r.status === 'fulfilled').length

      // Update sites list
      const targetCategory = categories.find((c) => c.id === categoryId)
      if (targetCategory) {
        setSites(
          sites.map((site) => {
            if (selectedSites.has(site.id)) {
              return {
                ...site,
                categoryId,
                category: targetCategory,
              }
            }
            return site
          }),
        )
      }

      setSelectedSites(new Set())
      setIsAllSelected(false)

      toast({
        title: '批量移动成功',
        description: `已移动 ${successCount} 个站点到新分类`,
      })
    } catch (error) {
      console.error('Error moving sites:', error)
      toast({
        title: '批量移动失败',
        description: '部分或全部站点移动失败，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setBatchMoveDialogOpen(false)
      setTargetCategoryId('')
      setIsBatchProcessing(false)
    }
  }

  const refreshSites = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/sites')
      if (response.ok) {
        const data = await response.json()
        setSites(data)
        toast({
          title: '刷新成功',
          description: '站点数据已更新',
        })
      } else {
        throw new Error('Failed to refresh sites')
      }
    } catch (error) {
      console.error('Error refreshing sites:', error)
      toast({
        title: '刷新失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSite = () => {
    setEditingSite(null)
    setDialogOpen(true)
  }

  const handleEditSite = (site: LoadableSiteWithCategory) => {
    setEditingSite(site)
    setDialogOpen(true)
  }

  const handleDeleteSite = (site: LoadableSiteWithCategory) => {
    setSiteToDelete(site)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteSite = async () => {
    if (!siteToDelete) return

    try {
      const response = await fetch(`/api/admin/sites/${siteToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSites(sites.filter((site) => site.id !== siteToDelete.id))
        toast({
          title: '删除成功',
          description: `站点 "${siteToDelete.title}" 已删除`,
        })
      } else {
        throw new Error('Failed to delete site')
      }
    } catch (error) {
      console.error('Error deleting site:', error)
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setSiteToDelete(null)
    }
  }

  const handleSaveSite = (savedSite: Site) => {
    // 这里是来自服务端的site结构,带有category,而且不包含imageLoadError
    const newSite = savedSite as LoadableSiteWithCategory
    if (editingSite) {
      // Update existing site
      setSites(sites.map((site) => (site.id === newSite.id ? newSite : site)))
    } else {
      // Add new site
      setSites([...sites, newSite])
    }
    setDialogOpen(false)
  }

  const handleCategoryCreate = (newCategory: Category) => {
    setCategories([...categories, newCategory])
  }

  const handleImageLoadError = (site: SiteWithCategory) => {
    setSites((prevSites) =>
      prevSites.map((s) => {
        if (s.id === site.id) {
          return { ...s, imageLoadError: true }
        }
        return s
      }),
    )
  }

  // Clear all selections
  const clearSelections = () => {
    setSelectedSites(new Set())
    setIsAllSelected(false)
  }
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm">当前共 {filteredSites.length} 条</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:items-center">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="搜索站点..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-[200px]" />
            <div className="flex gap-2">
              <Button onClick={handleAddSite}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={refreshSites} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Batch operations bar - only visible when items are selected */}
      <Card className={cn('bg-muted/50 px-4', selectedChanged === true ? (selectedSites.size > 0 ? 'batch-select-bar-fadein' : 'batch-select-bar-fadeout') : 'hidden')}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">已选择 {selectedSites.size} 项</span>
            {selectedSites.size > 0 && selectedSites.size < filteredSites.length && (
              <Button
                variant="link"
                size="sm"
                className="text-primary h-auto p-0"
                onClick={() => {
                  // Select all filtered items
                  const newSelected = new Set<number>()
                  filteredSites.forEach((site) => newSelected.add(site.id))
                  setSelectedSites(newSelected)
                  setIsAllSelected(true)
                }}
              >
                选择所有 {filteredSites.length} 项
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearSelections}>
              <X className="mr-1 h-4 w-4" />
              清除
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setBatchMoveDialogOpen(true)} disabled={selectedSites.size === 0}>
              <MoveHorizontal className="mr-1 h-4 w-4" />
              批量移动
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setBatchDeleteDialogOpen(true)} disabled={selectedSites.size === 0}>
              <Trash className="mr-1 h-4 w-4" />
              批量删除
            </Button>
          </div>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="Select all sites" />
              </TableHead>
              <TableHead className="hidden w-[80px] md:table-cell">ID</TableHead>
              <TableHead>名称</TableHead>
              <TableHead className="hidden md:table-cell">分类</TableHead>
              <TableHead className="hidden lg:table-cell">网址</TableHead>
              <TableHead className="w-[100px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  没有找到站点
                </TableCell>
              </TableRow>
            ) : (
              paginatedSites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell>
                    <Checkbox checked={selectedSites.has(site.id)} onCheckedChange={(checked) => handleSelectSite(site.id, !!checked)} aria-label={`Select site ${site.title}`} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{site.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {site.imageLoadError === true ? (
                        <Globe className="h-5 w-5" />
                      ) : (
                        <Image
                          src={site.imageUrl || `/api/icon/${site.id}`}
                          alt={site.title}
                          width={20}
                          height={20}
                          onError={() => handleImageLoadError(site)}
                          className="h-5 w-5 rounded-sm object-contain"
                        />
                      )}
                      <span className="font-medium">{site.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{site.category.name}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="line-clamp-1">{site.url}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditSite(site)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteSite(site)}>
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
          <p className="text-muted-foreground text-sm">每页显示</p>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number.parseInt(value))}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-sm">条</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
            上一页
          </Button>
          <p className="text-sm">
            {currentPage} / {totalPages || 1}
          </p>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
            下一页
          </Button>
        </div>
      </div>

      <SiteDialog open={dialogOpen} onOpenChange={setDialogOpen} site={editingSite} categories={categories} onSave={handleSaveSite} onCategoryCreate={handleCategoryCreate} />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="删除站点"
        description={`确定要删除站点 "${siteToDelete?.title}" 吗？此操作不可撤销。`}
        onConfirm={confirmDeleteSite}
      />

      {/* Batch Delete Dialog */}
      <DeleteConfirmDialog
        open={batchDeleteDialogOpen}
        onOpenChange={setBatchDeleteDialogOpen}
        title="批量删除站点"
        description={`确定要删除选中的 ${selectedSites.size} 个站点吗？此操作不可撤销。`}
        onConfirm={confirmBatchDelete}
        isLoading={isBatchProcessing}
      />

      {/* Batch Move Dialog */}
      <Dialog open={batchMoveDialogOpen} onOpenChange={setBatchMoveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>批量移动站点</DialogTitle>
            <DialogDescription>将选中的 {selectedSites.size} 个站点移动到新的分类</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="选择目标分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchMoveDialogOpen(false)} disabled={isBatchProcessing}>
              取消
            </Button>
            <Button onClick={confirmBatchMove} disabled={!targetCategoryId || isBatchProcessing}>
              {isBatchProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                '确认移动'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
