import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const secret = process.env.NEXTAUTH_SECRET;
    const url = process.env.NEXTAUTH_URL;

    // 测试生成 Google OAuth URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId || "");
    authUrl.searchParams.set("redirect_uri", `${url}/api/auth/callback/google`);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("access_type", "offline");

    return NextResponse.json({
      success: true,
      config: {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasSecret: !!secret,
        nextAuthUrl: url,
        clientIdLength: clientId?.length,
        clientSecretLength: clientSecret?.length,
      },
      generatedAuthUrl: authUrl.toString(),
      redirectUri: `${url}/api/auth/callback/google`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
