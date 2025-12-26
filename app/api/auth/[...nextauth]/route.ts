import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";

const nextAuthHandler = NextAuth(authOptions);

async function handler(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  try {
    return await nextAuthHandler(req, context);
  } catch (error) {
    console.error("[NextAuth] Handler error:", error);
    return NextResponse.json(
      {
        error: "Auth error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST };
