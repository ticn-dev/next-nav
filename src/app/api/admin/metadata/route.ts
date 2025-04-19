import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { metadata } = await request.json()

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete all existing metadata
      await tx.metaData.deleteMany({})

      // Create new metadata entries
      const newMetadata = []
      for (const item of metadata) {
        if (!item.key.trim() || !item.value.trim()) continue

        const newItem = await tx.metaData.create({
          data: {
            key: item.key.trim(),
            value: item.value.trim(),
          },
        })
        newMetadata.push(newItem)
      }

      return newMetadata
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating metadata:", error)
    return NextResponse.json({ error: "Failed to update metadata" }, { status: 500 })
  }
}
