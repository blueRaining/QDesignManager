import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  // 使用测试 callback 端点
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/test-callback`;

  // 生成简单的 state
  const state = Math.random().toString(36).substring(7);

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId || "");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);

  // 直接重定向到 Google
  return NextResponse.redirect(authUrl.toString());
}
