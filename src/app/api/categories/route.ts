import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        sites: true,
      },
      orderBy: [{order: "asc"}, {id: "asc"}],
    })

    // Filter out empty categories in the API response
    const nonEmptyCategories = categories.filter((category) => category.sites.length > 0)

    return NextResponse.json(nonEmptyCategories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({error: "Failed to fetch categories"}, {status: 500})
  }
}
