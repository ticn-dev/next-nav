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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useSettings } from "./settings-provider"
import Link from "next/link"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdminClick?: () => void
}

export function SettingsDialog({ open, onOpenChange, onAdminClick }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>调整导航页的设置，设置将自动保存。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new-tab"
              checked={settings.openInNewTab}
              onCheckedChange={(checked) => updateSettings({ openInNewTab: checked as boolean })}
            />
            <Label htmlFor="new-tab">在新标签页中打开链接</Label>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button asChild variant="outline" onClick={onAdminClick}>
            <Link href="/admin/system">管理员设置</Link>
          </Button>
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
