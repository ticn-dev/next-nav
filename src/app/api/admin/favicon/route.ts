import {prisma} from "@/lib/prisma"
import {type NextRequest, NextResponse} from "next/server"
import {updateSystemSetting} from "@/lib/settings";
import {revalidateTag} from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("favicon") as File | null

    if (!file) {
      await prisma.systemSettings.delete({
        where: {key: "favicon"},
      })
      revalidateTag("categories")
      return NextResponse.json({faviconUrl: null})
    }

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({error: "Invalid file type"}, {status: 400})
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({error: "File too large"}, {status: 400})
    }

    // base64 of favicon
    const b64Str = Buffer.from(await file.arrayBuffer()).toString("base64")

    const fileExt = file.name.split(".").pop()
    await updateSystemSetting('favicon', `${fileExt};${file.type};${b64Str}`)

    return NextResponse.json({faviconUrl: '/api/icon/this'})
  } catch (error) {
    console.error("Error uploading favicon:", error)
    return NextResponse.json({error: "Failed to upload favicon"}, {status: 500})
  }
}
