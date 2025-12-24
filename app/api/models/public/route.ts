import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { models, categories, users } from "@/lib/db/schema";
import { eq, and, desc, sql, like } from "drizzle-orm";

// 获取环境变量中的 D1 绑定
function getD1(): D1Database {
  // @ts-ignore
  return process.env.DB as unknown as D1Database;
}

// GET /api/models/public - 获取公开模型列表（无需登录）
export async function GET(request: NextRequest) {
  try {
    const d1 = getD1();
    const db = drizzle(d1);

    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt"; // createdAt, viewCount, downloadCount
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [eq(models.isPublic, true)];

    // 按分类筛选
    if (categorySlug) {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);

      if (category.length > 0) {
        conditions.push(eq(models.categoryId, category[0].id));
      }
    }

    // 搜索标题
    if (search) {
      conditions.push(like(models.title, `%${search}%`));
    }

    // 排序方式
    let orderBy;
    switch (sortBy) {
      case "viewCount":
        orderBy = desc(models.viewCount);
        break;
      case "downloadCount":
        orderBy = desc(models.downloadCount);
        break;
      default:
        orderBy = desc(models.createdAt);
    }

    // 查询模型列表
    const publicModels = await db
      .select({
        id: models.id,
        title: models.title,
        description: models.description,
        thumbnailUrl: models.thumbnailUrl,
        fileFormat: models.fileFormat,
        viewCount: models.viewCount,
        downloadCount: models.downloadCount,
        createdAt: models.createdAt,
        categoryId: models.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        userName: users.name,
        userImage: users.image,
      })
      .from(models)
      .leftJoin(categories, eq(models.categoryId, categories.id))
      .leftJoin(users, eq(models.userId, users.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(models)
      .where(and(...conditions));

    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: publicModels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch public models:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch public models" },
      { status: 500 }
    );
  }
}
