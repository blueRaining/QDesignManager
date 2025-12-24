import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { categories } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

// 获取环境变量中的 D1 绑定（Cloudflare Pages）
function getD1(): D1Database {
  // @ts-ignore - Cloudflare 环境变量
  return process.env.DB as unknown as D1Database;
}

// GET /api/categories - 获取所有分类
export async function GET(request: NextRequest) {
  try {
    const d1 = getD1();
    const db = drizzle(d1);

    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.displayOrder));

    return NextResponse.json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
