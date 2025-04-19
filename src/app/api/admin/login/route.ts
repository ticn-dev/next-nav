import {prisma} from "@/lib/prisma"
import {type NextRequest, NextResponse} from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const {username, password} = await request.json()

    if (!username || !password) {
      return NextResponse.json({error: "Username and password are required"}, {status: 400})
    }

    if (password.length < 5) {
      return NextResponse.json({error: "Password must be at least 5 characters"}, {status: 400})
    }

    // Hash the password with SHA-512
    const hashedPassword = crypto.createHash("sha512").update(password).digest("hex")

    // Check if admin exists
    const admin = await prisma.admin.findFirst()

    if (admin) {
      // Update existing admin
      await prisma.admin.update({
        where: {id: admin.id},
        data: {
          username,
          password: hashedPassword,
        },
      })
    } else {
      // Create new admin
      await prisma.admin.create({
        data: {
          username,
          password: hashedPassword,
        },
      })
    }

    return NextResponse.json({success: true})
  } catch (error) {
    console.error("Error updating admin:", error)
    return NextResponse.json({error: "Failed to update admin"}, {status: 500})
  }
}
