import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 需要保护的路由
const protectedPaths = ["/dashboard"];

// 公开 API 路由（不需要认证）
const publicApiPaths = ["/api/auth", "/api/models/public", "/api/categories", "/api/debug", "/api/auth-test", "/api/test-oauth", "/api/test-callback"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是受保护的路由
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // 检查是否是公开 API
  const isPublicApi = publicApiPaths.some((path) => pathname.startsWith(path));

  // 检查是否是需要认证的 API
  const isProtectedApi =
    pathname.startsWith("/api/") &&
    !isPublicApi &&
    !pathname.startsWith("/api/auth");

  if (isProtectedPath || isProtectedApi) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      if (isProtectedApi) {
        // API 返回 401
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // 页面重定向到登录
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 匹配所有路径，除了静态资源
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
