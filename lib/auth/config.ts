import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// NextAuth 配置
// 注意：完整的 D1 数据库适配器需要在 Cloudflare Pages 部署后配置
// 目前使用 JWT 策略进行开发

// 调试：打印环境变量状态
if (typeof process !== 'undefined') {
  console.log('[NextAuth] GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('[NextAuth] GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
  console.log('[NextAuth] NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
  console.log('[NextAuth] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  // Cloudflare Workers cookie 配置 - 移除 __Host- 和 __Secure- 前缀
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
        secure: true,
      },
    },
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
        secure: true,
      },
    },
  },
};

// 扩展 NextAuth 类型
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
