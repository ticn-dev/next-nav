'use client'

import { AdminManagerTable, AdminManagerTableRefs, SearchTermMatchProvider } from '@/components/admin/admin-manager-table'
import { TableCell, TableHead } from '@/components/ui/table'
import { Site, SiteWithCategory } from '@/types/site'
import FaviconImage from '@/components/next-nav/common/favicon-image'
import { Loader2, MoveHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { useEffect, useRef, useState } from 'react'
import { Category } from '@/types/category'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { SiteDialog } from '@/components/admin/site-dialog'
import { deleteSites, getCategories, getSites, updateSites } from '@/lib/api'

type SiteTermSearcherProvider = SearchTermMatchProvider<SiteWithCategory>

const defaultSiteTermSearcher: SiteTermSearcherProvider = {
  matchSearch(site: SiteWithCategory, term: string) {
    if (site.displayName.toLowerCase().includes(term)) {
      return true
    }
    if (site.url.toLowerCase().includes(term)) {
      return true
    }
    if (site.description && site.description.toLowerCase().includes(term)) {
      return true
    }
    return false
  },
}

export function SitesManagerTable() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<SiteWithCategory | null>(null)

  const [canMatchSearchTerm, setCanMatchSearchTerm] = useState<SiteTermSearcherProvider>(defaultSiteTermSearcher)
  const [batchMoveDialogOpen, setBatchMoveDialogOpen] = useState(false)
  const [targetCategoryId, setTargetCategoryId] = useState<string>('')
  const managerRef = useRef<AdminManagerTableRefs<SiteWithCategory>>(null)

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data)
    })
  }, [])

  useEffect(() => {
    if (!categoryFilter || categoryFilter === 'all') {
      setCanMatchSearchTerm(defaultSiteTermSearcher)
    } else {
      setCanMatchSearchTerm({
        matchSearch: defaultSiteTermSearcher.matchSearch,
        outerFilter(site) {
          return site.categoryId == parseInt(categoryFilter)
        },
      })
    }
  }, [categoryFilter])

  const handlerRequestRefresh = async () => {
    return await getSites()
  }

  const handlerTableHeaderRenderer = () => {
    return (
      <>
        <TableHead>名称</TableHead>
        <TableHead className="hidden md:table-cell">分类</TableHead>
        <TableHead className="hidden lg:table-cell">网址</TableHead>
      </>
    )
  }

  const handlerTableRowRenderer = (site: SiteWithCategory) => {
    return (
      <>
        <TableCell>
          <div className="flex items-center gap-2">
            <FaviconImage alt={site.displayName} src={site.imageUrl || `/api/icon/${site.id}`} width={20} height={20} className="h-5 w-5 rounded-sm object-contain" loading="lazy" />
            <span className="line-clamp-1">{site.displayName}</span>
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell">{site.category.displayName}</TableCell>
        <TableCell className="hidden lg:table-cell">
          <span className="line-clamp-1">{site.url}</span>
        </TableCell>
      </>
    )
  }

  const handlerTableBatchMoreAction = (selectedSites: Set<number>) => {
    return (
      <Button variant="outline" size="sm" onClick={() => setBatchMoveDialogOpen(true)} disabled={selectedSites.size === 0}>
        <MoveHorizontal className="mr-1 h-4 w-4" />
        批量移动
      </Button>
    )
  }

  const handlerTableBatchMoreFilter = () => {
    return (
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="选择分类" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部分类</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  const handlerTableRowMoreAction = () => {
    return <></>
  }

  const handlerConfirmBatchDelete = async (idOrIdArray: number | number[]) => {
    await deleteSites(idOrIdArray)
  }

  // Batch move sites to a different category
  const confirmBatchMove = async () => {
    const selectedSites = managerRef.current?.getBatchSelected()
    if (!selectedSites) {
      return
    }
    if (selectedSites.size === 0 || !targetCategoryId) return

    managerRef.current?.setIsBatchProcessing(true)
    try {
      const selectedArray = Array.from(selectedSites)
      const categoryId = Number.parseInt(targetCategoryId)
      await updateSites(selectedArray, { categoryId })

      // Update sites list
      const targetCategory = categories.find((c) => c.id === categoryId)
      if (targetCategory) {
        managerRef.current?.setItems((sites) => {
          return sites.map((site) => {
            if (selectedSites.has(site.id)) {
              return {
                ...site,
                categoryId,
                category: targetCategory,
              }
            }
            return site
          })
        })
      }

      managerRef.current?.resetBatch()

      toast({
        title: '批量移动成功',
        description: `已移动 ${selectedArray.length} 个站点到新分类`,
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
      managerRef.current?.setIsBatchProcessing(false)
    }
  }

  const moreActionBatchDialogRenderer = (selectedItems: Set<number>, isBatchProcessing: boolean) => {
    return (
      <Dialog open={batchMoveDialogOpen} onOpenChange={setBatchMoveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>批量移动站点</DialogTitle>
            <DialogDescription>将选中的 {selectedItems.size} 个站点移动到新的分类</DialogDescription>
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
                      {category.displayName}
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
    )
  }

  const handleSaveSite = (savedSite: Site) => {
    managerRef.current?.setItems((oldSites) => {
      // 这里是来自服务端的site结构,带有category
      const newSite = savedSite as SiteWithCategory
      if (editingSite) {
        // Update existing site
        return oldSites.map((site) => (site.id === newSite.id ? newSite : site))
      } else {
        // Add new site
        return [...oldSites, newSite]
      }
    })
    setDialogOpen(false)
  }

  const handleCategoryCreate = (newCategory: Category) => {
    setCategories([...categories, newCategory])
  }

  const handleRequestAddSite = () => {
    setEditingSite(null)
    setDialogOpen(true)
  }
  const handleRequestEditSite = (site: SiteWithCategory) => {
    setEditingSite(site)
    setDialogOpen(true)
  }

  return (
    <>
      <AdminManagerTable
        onRequestRefresh={handlerRequestRefresh}
        showName="站点"
        tableHeaderRenderer={handlerTableHeaderRenderer}
        tableHeadersCount={3}
        tableRowRenderer={handlerTableRowRenderer}
        tableBatchMoreAction={handlerTableBatchMoreAction}
        tableBatchMoreFilter={handlerTableBatchMoreFilter}
        tableRowMoreAction={handlerTableRowMoreAction}
        moreActionBatchDialogRenderer={moreActionBatchDialogRenderer}
        canMatchSearchTerm={canMatchSearchTerm}
        onConfirmBatchDelete={handlerConfirmBatchDelete}
        onRequestEdit={handleRequestEditSite}
        onRequestAdd={handleRequestAddSite}
        ref={managerRef}
      ></AdminManagerTable>

      <SiteDialog categories={categories} onCategoryCreate={handleCategoryCreate} onOpenChange={setDialogOpen} onSave={handleSaveSite} open={dialogOpen} site={editingSite} />
    </>
  )
}
