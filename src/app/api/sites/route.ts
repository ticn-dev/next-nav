import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"

export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      include: {
        category: true,
      },
      orderBy: [{order: "asc"}, {id: "asc"}],
    })

    return NextResponse.json(sites)
  } catch (error) {
    console.error("Error fetching sites:", error)
    return NextResponse.json({error: "Failed to fetch sites"}, {status: 500})
  }
}
