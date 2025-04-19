import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

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

export async function POST(request: Request) {
  try {
    const { name, order } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        order: order || 0,
      },
    })

    revalidateTag('categories')

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
