// middleware.js
import {NextRequest, NextResponse} from 'next/server';
import {prisma} from "@/lib/prisma";
import crypto from "crypto";

export async function middleware(request: NextRequest) {
  // 确定哪些路径需要保护
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/api/admin');

  // 如果不需要保护，直接放行
  if (!isAdminPath) {
    return NextResponse.next();
  }

  // 检查认证头部
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // 没有认证信息，返回401并要求认证
    return NextResponse.json({error: "no authorization"}, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    });
  }

  // 验证凭据
  try {
    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [username, password] = decodedCredentials.split(':');

    const adminAccount = await prisma.admin.findFirst()
    if (adminAccount === null) {
      return NextResponse.json({error: "管理员账号初始化失败"}, {status: 500})
    }

    const validUsername = adminAccount.username
    const validPassword = adminAccount.password

    const hashedPassword = crypto.createHash("sha512").update(password).digest("hex")

    if (username !== validUsername || hashedPassword.toLowerCase() !== validPassword.toLowerCase()) {
      // 凭据无效，返回401
      return NextResponse.json({error: '账号或密码错误'}, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      });
    }

    // 认证成功，继续请求
    return NextResponse.next();
  } catch (error) {
    console.error("Error during authentication:", error);
    // 处理错误
    return NextResponse.json({error: '认证处理时发生错误'}, {status: 500});
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
  runtime: 'nodejs'
};