import {prisma} from "@/lib/prisma"
import {type NextRequest, NextResponse} from "next/server"

export async function GET(request: NextRequest, {params: _params}: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = _params instanceof Promise ? await _params : _params
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({error: "Invalid ID"}, {status: 400})
    }

    const category = await prisma.category.findUnique({
      where: {id},
      include: {sites: true},
    })

    if (!category) {
      return NextResponse.json({error: "Category not found"}, {status: 404})
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({error: "Failed to fetch category"}, {status: 500})
  }
}

export async function PUT(request: NextRequest, {params}: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({error: "Invalid ID"}, {status: 400})
    }

    const {name, order} = await request.json()

    if (!name) {
      return NextResponse.json({error: "Name is required"}, {status: 400})
    }

    const category = await prisma.category.update({
      where: {id},
      data: {
        name,
        order: order || 0,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({error: "Failed to update category"}, {status: 500})
  }
}

export async function DELETE(request: NextRequest, {params}: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({error: "Invalid ID"}, {status: 400})
    }

    await prisma.category.delete({
      where: {id},
    })

    return NextResponse.json({success: true})
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({error: "Failed to delete category"}, {status: 500})
  }
}
