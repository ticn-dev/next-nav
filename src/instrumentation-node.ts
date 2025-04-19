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
