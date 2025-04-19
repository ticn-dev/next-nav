"use client"

import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { usePathname, useRouter } from "next/navigation"
import { Database, Globe, Lock, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet"

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent
      setOpen(customEvent.detail.isOpen)
    }

    document.addEventListener("toggleAdminMobileMenu", handleToggle)

    return () => {
      document.removeEventListener("toggleAdminMobileMenu", handleToggle)
    }
  }, [])

  const menuItems = [
    {
      name: "系统设置",
      path: "/admin/system",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      name: "站点设置",
      path: "/admin/sites",
      icon: <Globe className="mr-2 h-4 w-4" />,
    },
    {
      name: "分类设置",
      path: "/admin/categories",
      icon: <Database className="mr-2 h-4 w-4" />,
    },
    {
      name: "登录设置",
      path: "/admin/login",
      icon: <Lock className="mr-2 h-4 w-4" />,
    },
  ]

  const sidebarContent = (
    <nav className="space-y-2">
      {menuItems.map((item) => (
        <Button
          key={item.path}
          variant={pathname === item.path ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => {
            router.push(item.path)
            setOpen(false)
          }}
        >
          {item.icon}
          {item.name}
        </Button>
      ))}
    </nav>
  )

  return (
    <>
      <aside className={cn("w-64 shrink-0 border-r bg-background p-4", className)}>{sidebarContent}</aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 transition-transform duration-300">
          <SheetHeader>
            <SheetTitle>管理菜单</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{sidebarContent}</div>
        </SheetContent>
      </Sheet>
    </>
  )
}
