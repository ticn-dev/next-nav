import { prisma } from "@/lib/prisma"
import { fetchIcon } from "@/lib/favicon"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      include: {
        category: true,
      },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    })

    return NextResponse.json(sites)
  } catch (error) {
    console.error("Error fetching sites:", error)
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, url, imageUrl, description, categoryId, order } = await request.json()

    if (!title || !url || !categoryId) {
      return NextResponse.json({ error: "Title, URL, and category are required" }, { status: 400 })
    }

    // Create the site
    const site = await prisma.site.create({
      data: {
        title,
        url,
        imageUrl,
        description,
        categoryId,
        order: order || 0,
      },
      include: {
        category: true,
      },
    })

    // If no image URL is provided, try to fetch the favicon
    if (!imageUrl) {
      try {
        const icon = await fetchIcon(url)
        if (icon) {
          await prisma.site.update({
            where: { id: site.id },
            data: {
              imageUrl: icon.iconUrl,
              iconData: icon.iconData,
            },
          })

          // Update the site object with the new image URL
          site.imageUrl = icon.iconUrl
        }
      } catch (error) {
        console.error("Error fetching favicon:", error)
        // Continue without favicon
      }
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error("Error creating site:", error)
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 })
  }
}
