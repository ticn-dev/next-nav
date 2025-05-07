import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Archive, ArchiveRestore, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { BackupRestoreOptions } from '@/lib/backup-restore'
import { toast } from '@/components/ui/use-toast'
import { AdminBookmarksImport, BookmarksImportRef } from '@/components/next-nav/admin/admin-bookmarks-import'
import { Bookmarks } from '@/lib/bookmarks-parser'
import { doSystemBackup, doSystemRestore, importBookmarks, updateAesKey } from '@/lib/api'

const SelectBackupRestoreOptions: Record<keyof BackupRestoreOptions, string> = {
  systemSiteSettings: '系统站点设置',
  systemMetadata: '系统元数据',
  systemFavicon: '系统图标',
  siteData: '站点数据',
  categoryData: '分类数据',
  siteIconFiles: '站点图标文件',
} as const

interface CheckboxBackupRestoreOption {
  key: keyof BackupRestoreOptions
  value: string
  checked: boolean
}

function getDefaultOptions(): CheckboxBackupRestoreOption[] {
  return Object.entries(SelectBackupRestoreOptions).map(([key, value]) => ({
    key,
    value,
    checked: true,
  })) as CheckboxBackupRestoreOption[]
}

function optionsToBackupRestoreOptions(options: CheckboxBackupRestoreOption[]): BackupRestoreOptions {
  const backupRestoreOptions: BackupRestoreOptions = {} as BackupRestoreOptions
  options.forEach((option) => {
    backupRestoreOptions[option.key] = option.checked
  })
  return backupRestoreOptions
}

export function SystemDataBackup() {
  const [isBacking, setIsBacking] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogDescription, setDialogDescription] = useState('')
  const [currentOption, setCurrentOption] = useState<'backup' | 'restore'>('backup')
  const [options, setOptions] = useState(getDefaultOptions())
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const bookmarksImportRef = React.useRef<BookmarksImportRef>(null)

  useEffect(() => {
    if (!openDialog) {
      setSelectedFile(null)
    }
  }, [openDialog])

  const resetOptions = () => {
    setOptions(getDefaultOptions())
  }

  const handleBackup = async (backupRestoreOptions: BackupRestoreOptions) => {
    setIsBacking(true)
    try {
      const { url, filename, revoke } = await doSystemBackup(backupRestoreOptions)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      revoke()
    } catch (error) {
      console.error('Error during backup:', error)
      toast({
        title: '备份失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsBacking(false)
    }
  }

  const handleRestore = async (backupRestoreOptions: BackupRestoreOptions, file: File) => {
    setIsRestoring(true)
    try {
      await doSystemRestore(backupRestoreOptions, file)

      toast({ title: '恢复成功', description: '数据已成功恢复,将在2s后刷新页面' })
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Error during restore:', error)
      toast({
        title: '恢复失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsRestoring(false)
    }
  }

  const handleBackupRequestClick = () => {
    resetOptions()
    setDialogTitle('备份数据')
    setDialogDescription('选择要备份的数据')
    setCurrentOption('backup')
    setOpenDialog(true)
  }

  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      resetOptions()
      setDialogTitle('恢复数据')
      setDialogDescription('选择要恢复的数据')
      setCurrentOption('restore')
      setOpenDialog(true)
    }
    e.target.files = null
  }

  const handleOptionCheck = (key: keyof BackupRestoreOptions, checked: boolean) => {
    console.log('handleOptionCheck', key, checked)
    console.log(options.map((option) => (option.key === key ? { ...option, checked: checked } : option)))
    setOptions(options.map((option) => (option.key === key ? { ...option, checked: checked } : option)))
  }

  const handleDialogCommit = () => {
    const selectedOptions = optionsToBackupRestoreOptions(options)
    if (currentOption === 'backup') {
      handleBackup(selectedOptions)
    } else if (currentOption === 'restore') {
      handleRestore(selectedOptions, selectedFile!)
    }
    setOpenDialog(false)
  }

  const handleBookmarksSubmit = async (bookmarks: Bookmarks) => {
    setIsImporting(true)
    try {
      await importBookmarks(bookmarks)
      toast({ title: '导入成功' })
    } catch (error) {
      console.error('Error during backup:', error)
      toast({
        title: '导入失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleResetAesKey = async () => {
    try {
      await updateAesKey()
      toast({ title: '重置成功', description: '加密密钥已重置' })
    } catch (err) {
      console.error('Error during reset aes key:', err)
      toast({
        title: '重置失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>数据备份</CardTitle>
          <CardDescription>可以对系统数据进行备份或恢复</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button variant="outline" className="w-40" onClick={handleBackupRequestClick}>
            <Archive className="mr-2 h-4 w-4" />
            {isBacking ? '备份中...' : '备份数据'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/zip"
            onChange={handleRestoreFileChange}
            onClick={(event) => {
              ;(event.target as HTMLInputElement).value = ''
            }}
          />
          <Button variant="outline" className="w-40" onClick={() => fileInputRef.current?.click()}>
            <ArchiveRestore className="mr-2 h-4 w-4" />
            {isRestoring ? '恢复中...' : '恢复数据'}
          </Button>
          <Button variant="outline" className="w-40" onClick={() => bookmarksImportRef?.current?.doSelect()}>
            <Folder className="mr-2 h-4 w-4" />
            {isImporting ? '导入书签中...' : '导入书签'}
          </Button>
          <Button variant="outline" className="w-40" onClick={() => handleResetAesKey()}>
            <Folder className="mr-2 h-4 w-4" />
            重置加密密钥
          </Button>
        </CardContent>
      </Card>

      <AdminBookmarksImport ref={bookmarksImportRef} onSubmit={handleBookmarksSubmit}></AdminBookmarksImport>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {options.map((option) => (
              <div key={option.key} className="flex items-center space-x-2">
                <Checkbox id={`new-tab-${option.key}`} checked={option.checked} onCheckedChange={(checked) => handleOptionCheck(option.key as keyof BackupRestoreOptions, checked as boolean)} />
                <Label htmlFor={`new-tab-${option.key}`}>{option.value}</Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => handleDialogCommit()}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
