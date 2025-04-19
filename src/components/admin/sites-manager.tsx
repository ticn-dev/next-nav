"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Edit, Plus, RefreshCw, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { SiteDialog } from "./site-dialog"
import { AdminFooter } from "./admin-footer"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import Image from "next/image"

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

interface SitesManagerProps {
  initialSites: Site[]
  categories: Category[]
}

export function SitesManager({ initialSites, categories }: SitesManagerProps) {
  const [sites, setSites] = useState<Site[]>(initialSites)
  const [filteredSites, setFilteredSites] = useState<Site[]>(initialSites)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(Math.ceil(initialSites.length / pageSize))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)

  // Filter and paginate sites
  useEffect(() => {
    let result = [...sites]

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((site) => site.categoryId === Number.parseInt(categoryFilter))
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (site) =>
          site.title.toLowerCase().includes(term) ||
          site.url.toLowerCase().includes(term) ||
          (site.description && site.description.toLowerCase().includes(term)),
      )
    }

    setTotalPages(Math.ceil(result.length / pageSize))
    setFilteredSites(result)

    // Reset to first page when filters change
    setCurrentPage(1)
  }, [sites, categoryFilter, searchTerm, pageSize])

  const paginatedSites = filteredSites.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const refreshSites = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/sites")
      if (response.ok) {
        const data = await response.json()
        setSites(data)
        toast({
          title: "刷新成功",
          description: "站点数据已更新",
        })
      } else {
        throw new Error("Failed to refresh sites")
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

  const handleAddSite = () => {
    setEditingSite(null)
    setDialogOpen(true)
  }

  const handleEditSite = (site: Site) => {
    setEditingSite(site)
    setDialogOpen(true)
  }

  const handleDeleteSite = (site: Site) => {
    setSiteToDelete(site)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteSite = async () => {
    if (!siteToDelete) return

    try {
      const response = await fetch(`/api/admin/sites/${siteToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSites(sites.filter((site) => site.id !== siteToDelete.id))
        toast({
          title: "删除成功",
          description: `站点 "${siteToDelete.title}" 已删除`,
        })
      } else {
        throw new Error("Failed to delete site")
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSiteToDelete(null)
    }
  }

  const handleSaveSite = (savedSite: Site) => {
    if (editingSite) {
      // Update existing site
      setSites(sites.map((site) => (site.id === savedSite.id ? savedSite : site)))
    } else {
      // Add new site
      setSites([...sites, savedSite])
    }
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">当前共 {filteredSites.length} 条</div>
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
            <Input
              placeholder="搜索站点..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-[200px]"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddSite}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={refreshSites} disabled={isLoading}>
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
              <TableHead className="hidden md:table-cell">分类</TableHead>
              <TableHead className="hidden lg:table-cell">网址</TableHead>
              <TableHead className="w-[100px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  没有找到站点
                </TableCell>
              </TableRow>
            ) : (
              paginatedSites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="hidden md:table-cell">{site.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {site.imageUrl ? (
                        <Image
                          src={site.imageUrl || "/placeholder.svg"}
                          alt={site.title}
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded-sm object-contain"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-sm bg-muted" />
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
          <p className="text-sm text-muted-foreground">每页显示</p>
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

      <SiteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        site={editingSite}
        categories={categories}
        onSave={handleSaveSite}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="删除站点"
        description={`确定要删除站点 "${siteToDelete?.title}" 吗？此操作不可撤销。`}
        onConfirm={confirmDeleteSite}
      />
    </div>
  )
}
