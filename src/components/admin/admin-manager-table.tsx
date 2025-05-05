'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Edit, Plus, RefreshCw, Trash, X } from 'lucide-react'
import React, { Ref, useEffect, useRef, useState } from 'react'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { cn } from '@/lib/utils'

interface AdminManagerItem {
  id: number
  displayName: string
}

export interface SearchTermMatchProvider<T extends AdminManagerItem> {
  matchSearch(item: T, searchTerm: string): boolean

  outerFilter?: (item: T) => boolean
}

interface AdminManagerTableProps<T extends AdminManagerItem> {
  canMatchSearchTerm?: SearchTermMatchProvider<T>
  onRequestRefresh: () => Promise<T[]>
  onConfirmBatchDelete?: (idOrIdArray: number | number[]) => Promise<void>
  tableHeadersCount: number
  tableHeaderRenderer: () => React.ReactNode
  tableRowRenderer: (item: T) => React.ReactNode
  tableRowMoreAction?: (item: T) => React.ReactNode
  tableBatchMoreAction?: (selectedItems: Set<number>) => React.ReactNode
  tableBatchMoreFilter?: () => React.ReactNode
  moreActionBatchDialogRenderer?: (selectedItems: Set<number>, isBatchProcessing: boolean) => React.ReactNode
  onRequestEdit?: (item: T) => void
  onRequestAdd?: () => void
  ref?: Ref<AdminManagerTableRefs<T>>
  showName: string
}

export interface AdminManagerTableRefs<T extends AdminManagerItem> {
  getBatchSelected(): Set<number>

  setIsBatchProcessing(value: boolean): void

  resetBatch(): void

  setItems(itemsOrMapper: T[] | ((items: T[]) => T[])): void
}

export function AdminManagerTable<T extends AdminManagerItem>({
  canMatchSearchTerm,
  onRequestRefresh,
  tableHeaderRenderer,
  tableHeadersCount,
  tableRowRenderer,
  tableRowMoreAction,
  onConfirmBatchDelete,
  tableBatchMoreFilter,
  tableBatchMoreAction,
  onRequestEdit,
  onRequestAdd,
  ref,
  showName,
  moreActionBatchDialogRenderer,
}: AdminManagerTableProps<T>) {
  const [items, setItems] = useState<T[]>([])
  const [filteredItems, setFilteredItems] = useState<T[]>([])
  const [paginatedItems, setPaginatedItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)

  // Batch operation states
  const [selectedChanged, setSelectedChanged] = useState<boolean | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)

  const refInstance = useRef<AdminManagerTableRefs<T>>({
    getBatchSelected(): Set<number> {
      return selectedItems
    },
    resetBatch() {
      resetBatch()
    },
    setIsBatchProcessing(value: boolean) {
      setIsBatchProcessing(value)
    },
    setItems(itemsOrMapper) {
      if (Array.isArray(itemsOrMapper)) {
        setItems(itemsOrMapper)
      } else {
        setItems((prev) => itemsOrMapper(prev))
      }
    },
  })

  useEffect(() => {
    setIsLoading(true)
    onRequestRefresh()
      .then((data) => {
        setItems(data)
      })
      .finally(() => {
        setIsLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(refInstance.current)
      } else {
        ref.current = refInstance.current
      }
    }
    return () => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(null)
        } else {
          ref.current = null
        }
      }
    }
  }, [ref])

  useEffect(() => {
    if (selectedChanged === null) {
      setSelectedChanged(selectedItems.size > 0)
    } else {
      setSelectedChanged(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems])

  // Filter and paginate items
  useEffect(() => {
    let result: T[] = items

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = items.filter((item) => canMatchSearchTerm?.matchSearch(item, term) ?? true)
    }

    if (canMatchSearchTerm && canMatchSearchTerm.outerFilter) {
      result = result.filter((item) => canMatchSearchTerm.outerFilter?.(item) ?? true)
    }

    setTotalPages(Math.ceil(result.length / pageSize))
    setFilteredItems(result)

    // Reset to first page when filters change
    setCurrentPage(1)
  }, [items, searchTerm, pageSize, canMatchSearchTerm])

  useEffect(() => {
    setPaginatedItems(filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize))
  }, [filteredItems, currentPage, pageSize])

  useEffect(() => {
    // Update isAllSelected based on whether all filtered items are selected
    if (selectedItems.size > 0) {
      const allFilteredSelected = paginatedItems.every((item) => selectedItems.has(item.id))
      setIsAllSelected(allFilteredSelected && paginatedItems.length > 0)
    } else {
      setIsAllSelected(false)
    }
  }, [paginatedItems, selectedItems])

  // Handle "select all" checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      // If all items on current page are selected, deselect them
      const newSelected = new Set(selectedItems)
      paginatedItems.forEach((item) => newSelected.delete(item.id))
      setSelectedItems(newSelected)
      setIsAllSelected(false)
    } else {
      // Select all items on current page
      const newSelected = new Set(selectedItems)
      paginatedItems.forEach((item) => newSelected.add(item.id))
      setSelectedItems(newSelected)
      setIsAllSelected(true)
    }
  }

  // Handle individual checkbox selection
  const handleSelectItem = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedItems(newSelected)

    // Update "select all" state
    setIsAllSelected(newSelected.size === paginatedItems.length && newSelected.size > 0)
  }

  const resetBatch = () => {
    setSelectedItems(new Set())
    setIsAllSelected(false)
  }

  // Batch delete items
  const confirmBatchDelete = async () => {
    if (selectedItems.size === 0) return

    setIsBatchProcessing(true)
    try {
      if (onConfirmBatchDelete === undefined) {
        return
      }
      const selectedArray = Array.from(selectedItems)
      await onConfirmBatchDelete(selectedArray)

      // Update items list
      setItems(items.filter((item) => !selectedItems.has(item.id)))

      resetBatch()

      toast({
        title: '批量删除成功',
        description: `已删除 ${selectedArray.length} 个${showName}`,
      })
    } catch (error) {
      console.error('Error deleting items:', error)
      toast({
        title: '批量删除失败',
        description: `部分或全部${showName}删除失败，请稍后重试`,
        variant: 'destructive',
      })
    } finally {
      setBatchDeleteDialogOpen(false)
      setIsBatchProcessing(false)
    }
  }

  const refreshItems = async () => {
    setIsLoading(true)
    try {
      const data = await onRequestRefresh()
      setItems(data)
      toast({
        title: '刷新成功',
        description: `${showName}数据已更新`,
      })
    } catch (error) {
      console.error('Error refreshing items:', error)
      toast({
        title: '刷新失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteItem = (item: T) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return

    try {
      await onConfirmBatchDelete?.(itemToDelete.id)

      setItems(items.filter((item) => item.id !== itemToDelete.id))
      toast({
        title: '删除成功',
        description: `${showName} "${itemToDelete.displayName}" 已删除`,
      })
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: `删除失败`,
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  // Clear all selections
  const clearSelections = () => {
    setSelectedItems(new Set())
    setIsAllSelected(false)
  }
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm">当前共 {filteredItems.length} 条</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:items-center">
            {tableBatchMoreFilter && tableBatchMoreFilter()}
            <Input placeholder={`搜索${showName}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-[200px]" />
            <div className="flex gap-2">
              <Button onClick={onRequestAdd}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={refreshItems} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Batch operations bar - only visible when items are selected */}
      <Card className={cn('bg-muted/50 px-4', selectedChanged === true ? (selectedItems.size > 0 ? 'batch-select-bar-fadein' : 'batch-select-bar-fadeout') : 'hidden')}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">已选择 {selectedItems.size} 项</span>
            {selectedItems.size > 0 && selectedItems.size < filteredItems.length && (
              <Button
                variant="link"
                size="sm"
                className="text-primary h-auto p-0"
                onClick={() => {
                  // Select all filtered items
                  const newSelected = new Set<number>()
                  filteredItems.forEach((item) => newSelected.add(item.id))
                  setSelectedItems(newSelected)
                  setIsAllSelected(true)
                }}
              >
                选择所有 {filteredItems.length} 项
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearSelections}>
              <X className="mr-1 h-4 w-4" />
              清除
            </Button>
          </div>
          <div className="flex gap-2">
            {tableBatchMoreAction && tableBatchMoreAction(selectedItems)}
            <Button variant="destructive" size="sm" onClick={() => setBatchDeleteDialogOpen(true)} disabled={selectedItems.size === 0}>
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
                <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="Select all items" />
              </TableHead>
              <TableHead className="hidden w-[80px] md:table-cell">ID</TableHead>
              {tableHeaderRenderer()}
              <TableHead className="w-[100px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableHeadersCount + 3} className="h-24 text-center">
                  没有找到{showName}
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox checked={selectedItems.has(item.id)} onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)} aria-label={`Select item ${item.id}`} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{item.id}</TableCell>

                  {tableRowRenderer(item)}

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {tableRowMoreAction && tableRowMoreAction(item)}
                      <Button variant="ghost" size="icon" onClick={() => onRequestEdit?.(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item)}>
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
            <SelectTrigger className="w-[75px]">
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`删除${showName}`}
        description={`确定要删除${showName} "${itemToDelete?.displayName}" 吗？此操作不可撤销。`}
        onConfirm={confirmDeleteItem}
      />

      {/* Batch Delete Dialog */}
      <DeleteConfirmDialog
        open={batchDeleteDialogOpen}
        onOpenChange={setBatchDeleteDialogOpen}
        title={`批量删除${showName}`}
        description={`确定要删除选中的 ${selectedItems.size} 个${showName}吗？此操作不可撤销。`}
        onConfirm={confirmBatchDelete}
        isLoading={isBatchProcessing}
      />

      {moreActionBatchDialogRenderer && moreActionBatchDialogRenderer(selectedItems, isBatchProcessing)}
    </div>
  )
}
