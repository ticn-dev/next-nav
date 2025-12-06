import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['better-sqlite3', '@prisma/adapter-better-sqlite3'],
}

export default nextConfig
