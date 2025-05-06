import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'

export async function PATCH(request: NextRequest) {
  try {
    const { ids, value } = (await request.json()) as { ids: number[]; value: { categoryId: number } }

    // update the site
    const sites = await prisma.site.updateManyAndReturn({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        categoryId: value.categoryId,
      },
      include: {
        category: true,
      },
    })

    revalidateTag('index')

    return NextResponse.json(sites)
  } catch (error) {
    console.error('Error patching site:', error)
    return NextResponse.json({ error: 'Failed to update site' }, { status: 500 })
  }
}
