"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, SunMoon } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <SunMoon className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const cycleTheme = () => {
    if (theme === "system") {
      // If system, switch to light or dark based on current system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark"
      setTheme(systemTheme)
    } else if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("system")
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={cycleTheme} className="relative">
      {theme === "system" ? (
        <>
          <SunMoon className="h-5 w-5" />
          <span className="absolute bottom-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
            A
          </span>
        </>
      ) : theme === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
