import { StyleSettings } from '@/components/admin/style-settings'
import { getStyleSettings } from '@/lib/style-settings'
import { StyleSettingsProvider } from '@/components/style-settings-provider'

export const dynamic = 'force-dynamic' // 使用force-dynamic确保每次请求都重新获取最新的样式设置数据，避免缓存

export const metadata = {
  title: '样式设置',
}

export default async function StyleSettingsPage() {
  const styleSettings = await getStyleSettings()

  return (
    <StyleSettingsProvider initialSettings={styleSettings}>
      <div className="container mx-auto">
        <h1 className="mb-6 text-2xl font-bold">样式设置</h1>
        <StyleSettings initialSettings={styleSettings} />
      </div>
    </StyleSettingsProvider>
  )
}
