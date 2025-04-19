import {prisma} from "@/lib/prisma"
import {type NextRequest, NextResponse} from "next/server"
import {getSystemSettings} from "@/lib/settings";

export async function GET(request: NextRequest, {params: _params}: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    if (params.id === "this") {
      // return this system icon
      const settings = await getSystemSettings('favicon')
      const favicon = settings.favicon
      if (favicon) {
        const [fileExt, mimeType, base64] = favicon.split(";", 3)
        const buffer = Buffer.from(base64, "base64")
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=31536000, immutable",
            "x-favicon-type": fileExt,
          }
        })
      } else {
        return new NextResponse(null, {status: 404})
      }
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return new NextResponse(null, {status: 400})
    }

    const site = await prisma.site.findUnique({
      where: {id},
      select: {iconData: true, imageUrl: true},
    })

    if (!site) {
      return new NextResponse(null, {status: 404})
    }

    // If we have icon data, return it
    if (site.iconData) {
      return new NextResponse(site.iconData, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    }

    // If we have an image URL, redirect to it
    if (site.imageUrl) {
      return NextResponse.redirect(site.imageUrl)
    }

    // Otherwise, return 404
    return new NextResponse(null, {status: 404})
  } catch (error) {
    console.error("Error fetching icon:", error)
    return new NextResponse(null, {status: 500})
  }
}
