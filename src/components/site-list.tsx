import { SiteCard } from '@/components/site-card'
import { getSitesByCategory } from '@/lib/sites' // 假设您有一个获取站点的函数

interface SiteListProps {
  categoryId: number
}

export async function SiteList({ categoryId }: SiteListProps) {
  // 获取该分类下的所有站点
  const sites = await getSitesByCategory(categoryId)

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} />
      ))}
    </div>
  )
}
