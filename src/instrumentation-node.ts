import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const admins = await prisma.admin.findFirst()
if (admins === null) {
  console.log('No admin user found, creating one..., default username and password is admin')
  // Hash the password with SHA-512
  const hashedPassword = crypto.createHash('sha512').update('admin').digest('hex')

  await prisma.admin.create({
    data: {
      username: 'admin',
      password: hashedPassword,
    },
  })
}

const defaultCategory = await prisma.category.findFirst({
  where: {
    id: -1,
  },
})
if (defaultCategory === null) {
  console.log('No default category found, creating one..., default category name is default')
  await prisma.category.create({
    data: {
      id: -1,
      name: '默认分类',
      order: 0,
    },
  })
}
