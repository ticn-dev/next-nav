import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { Category } from '@/types/category'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        sites: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { ids: number[]; value: Omit<Category, 'id'> }
    const { ids, value } = body

    if (!value.displayName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const category = await prisma.category.updateManyAndReturn({
      where: { id: { in: ids } },
      data: value,
    })

    revalidateTag('index')

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ids = ((await request.json()) as number[]).filter((id) => id != -1)

    // 删除分类前,将该分类下的所有站点全部转移到默认分类
    await prisma.site.updateMany({
      where: { categoryId: { in: ids } },
      data: { categoryId: -1 },
    })

    await prisma.category.deleteMany({
      where: { id: { in: ids } },
    })

    revalidateTag('index')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { displayName, order } = (await request.json()) as Omit<Category, 'id'>

    if (!displayName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        displayName,
        order: order || 0,
      },
    })

    revalidateTag('index')

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
