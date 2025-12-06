import { PrismaClient } from '@/lib/prisma/generated/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./data/data.db',
})

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    adapter,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
