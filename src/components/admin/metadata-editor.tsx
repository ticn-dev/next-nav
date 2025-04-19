"use client"

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {toast} from "@/components/ui/use-toast"
import {Plus, Trash} from "lucide-react"
import {useState} from "react"

interface MetaData {
  id: number
  key: string
  value: string
}

interface EditableMetaData {
  id: number
  key: string
  value: string
  [isCustomKey]: boolean
}

interface MetadataEditorProps {
  initialMetadata: MetaData[]
  onUpdate?: (metadata: MetaData[]) => void
}

const predefinedKeys = new Set([
  "description",
  "keywords",
  "author",
  "robots",
  "viewport",
  "og:title",
  "og:description",
  "og:image",
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
  "google-site-verification",
])

const predefinedKeysArray = Array.from(predefinedKeys.values())

const isCustomKey = Symbol("isCustomKey")

export function MetadataEditor({initialMetadata, onUpdate}: MetadataEditorProps) {
  const [metadata, setMetadata] = useState<EditableMetaData[]>(initialMetadata.map((item)=>{
    return {
      ...item,
      [isCustomKey]: !predefinedKeys.has(item.key),
    }
  }))
  const [isSaving, setIsSaving] = useState(false)

  const addMetadata = () => {
    // Create a temporary ID for new items
    const newId = -1 * (metadata.length + 1)
    setMetadata([...metadata, {id: newId, key: "", value: "", [isCustomKey]: false}])
  }

  const removeMetadata = (index: number) => {
    const newMetadata = [...metadata]
    newMetadata.splice(index, 1)
    setMetadata(newMetadata)
  }

  const updateMetadata = (index: number, field: "key" | "value", value: string, fromSelect: boolean) => {
    const newMetadata = [...metadata]
    newMetadata[index][field] = value
    if (field === "key" && fromSelect) {
      if (value === "#custom") {
        newMetadata[index].key = ""
        newMetadata[index][isCustomKey] = true
      } else {
        newMetadata[index][isCustomKey] = false
      }
    }
    setMetadata(newMetadata)
  }

  const handleSave = async () => {
    // Validate metadata
    for (const item of metadata) {
      if (!item.key.trim() || !item.value.trim()) {
        toast({
          title: "验证失败",
          description: "元数据的键和值不能为空",
          variant: "destructive",
        })
        return
      }
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({metadata}),
      })

      if (response.ok) {
        const updatedMetadata = await response.json()
        setMetadata(updatedMetadata)
        toast({
          title: "保存成功",
          description: "元数据已更新",
        })
        onUpdate?.(updatedMetadata)
      } else {
        throw new Error("Failed to save metadata")
      }
    } catch (error) {
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>元数据设置</CardTitle>
        <CardDescription>设置网站的元数据，用于SEO优化和社交媒体分享</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {metadata.map((item, index) => (
          <div key={item.id} className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label>键名</Label>
              {item[isCustomKey] ? (
                <Input
                  value={item.key}
                  onChange={(e) => updateMetadata(index, "key", e.target.value, false)}
                  placeholder="自定义键名"
                />
              ) : (
                <Select value={item.key} onValueChange={(value) => updateMetadata(index, "key", value, true)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择或输入键名"/>
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedKeysArray.map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                    <SelectItem value="#custom" className="text-purple-500 focus:text-purple-500">自定义</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label>值</Label>
              <Input
                value={item.value}
                onChange={(e) => updateMetadata(index, "value", e.target.value, false)}
                placeholder="元数据值"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeMetadata(index)} className="mb-0.5">
              <Trash className="h-4 w-4"/>
            </Button>
          </div>
        ))}
        <div className="flex justify-between">
          <Button variant="outline" onClick={addMetadata} disabled={isSaving}>
            <Plus className="mr-2 h-4 w-4"/>
            添加元数据
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
