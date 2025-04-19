import { SitesManager } from "@/components/admin/sites-manager"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

async function getSites() {
  const sites = await prisma.site.findMany({
    include: {
      category: true,
    },
    orderBy: [{ order: "asc" }, { id: "asc" }],
  })

  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  })

  return { sites, categories }
}

export const metadata = {
  title: "站点设置",
}

export default async function SitesPage() {
  const { sites, categories } = await getSites()

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">站点设置</h1>
      <SitesManager initialSites={sites} categories={categories} />
    </div>
  )
}
