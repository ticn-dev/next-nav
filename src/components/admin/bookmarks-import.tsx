import { Button } from '@/components/ui/button'
import React, { useImperativeHandle } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Bookmarks, parseBookmarks } from '@/lib/bookmarks-parser'
import { toast } from '@/components/ui/use-toast'

export interface BookmarksImportRef {
  doSelect: () => void
}

interface BookmarksImportProps {
  ref?: React.Ref<BookmarksImportRef>
  onSubmit?: (bookmarks: Bookmarks) => void
}

interface ParsedResult {
  bookmarks: Bookmarks
  bookmarkCount: number
  categoryCount: number
  uncategorizedCount: number
}

export function BookmarksImport({ ref, onSubmit }: BookmarksImportProps) {
  const [openDialog, setOpenDialog] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [parsedBookmarks, setParsedBookmarks] = React.useState<ParsedResult>({
    bookmarks: { categories: [], uncategorized: [] },
    bookmarkCount: 0,
    categoryCount: 0,
    uncategorizedCount: 0,
  })

  useImperativeHandle(ref, () => {
    return {
      doSelect() {
        fileInputRef.current?.click()
      },
    }
  }, [])

  const handleBookmarksFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const bookmarks = parseBookmarks(content)

          const allBookmarkCount = bookmarks.categories.reduce((acc, category) => acc + category.bookmarks.length, 0) + bookmarks.uncategorized.length
          const allCategoryCount = bookmarks.categories.length + (bookmarks.uncategorized.length > 0 ? 1 : 0)
          setParsedBookmarks({ bookmarks, bookmarkCount: allBookmarkCount, categoryCount: allCategoryCount, uncategorizedCount: bookmarks.uncategorized.length })
          setOpenDialog(true)
        } catch (e) {
          console.error('Error parsing bookmarks:', e)
          toast({
            title: '导入失败',
            description: '无法解析书签文件，请确保文件格式正确。',
            variant: 'destructive',
          })
        }
      }
      reader.onerror = (e) => {
        console.error('Error reading file:', e)
        toast({
          title: '导入失败',
          description: '无法读取文件，请稍后重试。',
          variant: 'destructive',
        })
      }
      reader.readAsText(file)
    }
  }

  const handleDialogCancel = () => {
    setOpenDialog(false)
  }

  const handleDialogConfirm = () => {
    setOpenDialog(false)
    if (onSubmit) {
      onSubmit(parsedBookmarks.bookmarks)
    }
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="text/html"
        onChange={handleBookmarksFileChange}
        onClick={(event) => {
          ;(event.target as HTMLInputElement).value = ''
        }}
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>导入书签</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <span>包含</span>
            <div>{parsedBookmarks.bookmarkCount} 个网站</div>
            <div>{parsedBookmarks.categoryCount} 个分类</div>
            <div>{parsedBookmarks.uncategorizedCount} 个未分类网站</div>
            <div>确定要导入这些书签吗？</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogCancel()}>
              取消
            </Button>
            <Button onClick={() => handleDialogConfirm()}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
