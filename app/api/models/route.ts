import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { drizzle } from "drizzle-orm/d1";
import { models, categories } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// 获取环境变量中的 D1 绑定（Cloudflare Pages）
function getD1(): D1Database {
  // @ts-ignore - Cloudflare 环境变量
  return process.env.DB as unknown as D1Database;
}

// GET /api/models - 获取当前用户的模型列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const d1 = getD1();
    const db = drizzle(d1);

    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("category");
    const isPublic = searchParams.get("isPublic");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [eq(models.userId, session.user.id)];
    if (categoryId) {
      conditions.push(eq(models.categoryId, categoryId));
    }
    if (isPublic !== null) {
      conditions.push(eq(models.isPublic, isPublic === "true"));
    }

    // 查询模型列表
    const userModels = await db
      .select({
        id: models.id,
        title: models.title,
        description: models.description,
        isPublic: models.isPublic,
        thumbnailUrl: models.thumbnailUrl,
        fileFormat: models.fileFormat,
        fileSize: models.fileSize,
        viewCount: models.viewCount,
        downloadCount: models.downloadCount,
        createdAt: models.createdAt,
        updatedAt: models.updatedAt,
        categoryId: models.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(models)
      .leftJoin(categories, eq(models.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(models.createdAt))
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
      data: userModels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}

// POST /api/models - 创建新模型
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      isPublic,
      modelFileKey,
      modelFileUrl,
      fileSize,
      fileFormat,
      originalFileName,
      thumbnailKey,
      thumbnailUrl,
    } = body;

    // 验证必填字段
    if (!title || !categoryId || !modelFileKey || !modelFileUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const d1 = getD1();
    const db = drizzle(d1);

    const modelId = nanoid();
    const now = new Date();

    const newModel = await db
      .insert(models)
      .values({
        id: modelId,
        userId: session.user.id,
        title,
        description: description || null,
        categoryId,
        isPublic: isPublic ?? false,
        modelFileKey,
        modelFileUrl,
        fileSize: fileSize || 0,
        fileFormat: fileFormat || "glb",
        originalFileName: originalFileName || null,
        thumbnailKey: thumbnailKey || null,
        thumbnailUrl: thumbnailUrl || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: newModel[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create model:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create model" },
      { status: 500 }
    );
  }
}
