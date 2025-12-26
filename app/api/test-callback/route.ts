import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error, description: searchParams.get("error_description") });
  }

  if (!code) {
    return NextResponse.json({ error: "No authorization code received" });
  }

  // 尝试用 code 换取 token
  try {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/test-callback`;

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return NextResponse.json({
        error: "Token exchange failed",
        status: tokenResponse.status,
        data: tokenData,
      });
    }

    // 获取用户信息
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    return NextResponse.json({
      success: true,
      message: "OAuth flow completed successfully!",
      tokenReceived: !!tokenData.access_token,
      userInfo,
    });
  } catch (err) {
    return NextResponse.json({
      error: "Exception during token exchange",
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
    });
  }
}
