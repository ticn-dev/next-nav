import { StyleSettings } from "@/components/admin/style-settings"
import { getStyleSettings } from "@/lib/style-settings"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "样式设置",
}

export default async function StyleSettingsPage() {
  const styleSettings = await getStyleSettings()

  return (
    <div className="container mx-auto">
      <h1 className="mb-6 text-2xl font-bold">样式设置</h1>
      <StyleSettings initialSettings={styleSettings} />
    </div>
  )
}
