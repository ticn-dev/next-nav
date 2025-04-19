import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: { sites: true },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const { name, order } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        order: order || 0,
      },
    })

    revalidateTag('categories')

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    if (id === -1) {
      return NextResponse.json({ error: 'Cannot delete default category' }, { status: 400 })
    }

    // 删除分类前,将该分类下的所有站点全部转移到默认分类
    await prisma.site.updateMany({
      where: { categoryId: id },
      data: { categoryId: -1 },
    })

    await prisma.category.delete({
      where: { id },
    })

    revalidateTag('categories')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
