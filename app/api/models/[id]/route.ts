import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { drizzle } from "drizzle-orm/d1";
import { models, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteModelFiles } from "@/lib/r2/upload";

// 获取环境变量中的 D1 绑定
function getD1(): D1Database {
  // @ts-ignore
  return process.env.DB as unknown as D1Database;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/models/[id] - 获取模型详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    const d1 = getD1();
    const db = drizzle(d1);

    const result = await db
      .select({
        id: models.id,
        userId: models.userId,
        title: models.title,
        description: models.description,
        isPublic: models.isPublic,
        modelFileKey: models.modelFileKey,
        modelFileUrl: models.modelFileUrl,
        fileSize: models.fileSize,
        fileFormat: models.fileFormat,
        originalFileName: models.originalFileName,
        thumbnailKey: models.thumbnailKey,
        thumbnailUrl: models.thumbnailUrl,
        polygonCount: models.polygonCount,
        vertexCount: models.vertexCount,
        textureCount: models.textureCount,
        animationCount: models.animationCount,
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
      .where(eq(models.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Model not found" },
        { status: 404 }
      );
    }

    const model = result[0];

    // 权限检查：私有模型只有所有者可以访问
    if (!model.isPublic && model.userId !== session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // 增加浏览次数（仅对非所有者）
    if (model.userId !== session?.user?.id) {
      await db
        .update(models)
        .set({ viewCount: (model.viewCount || 0) + 1 })
        .where(eq(models.id, id));
    }

    return NextResponse.json({ success: true, data: model });
  } catch (error) {
    console.error("Failed to fetch model:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch model" },
      { status: 500 }
    );
  }
}

// PUT /api/models/[id] - 更新模型
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const d1 = getD1();
    const db = drizzle(d1);

    // 验证所有权
    const existingModel = await db
      .select()
      .from(models)
      .where(and(eq(models.id, id), eq(models.userId, session.user.id)))
      .limit(1);

    if (existingModel.length === 0) {
      return NextResponse.json(
        { success: false, error: "Model not found or unauthorized" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      isPublic,
      thumbnailKey,
      thumbnailUrl,
    } = body;

    // 构建更新对象
    const updateData: Partial<typeof models.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (thumbnailKey !== undefined) updateData.thumbnailKey = thumbnailKey;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;

    const updatedModel = await db
      .update(models)
      .set(updateData)
      .where(eq(models.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedModel[0] });
  } catch (error) {
    console.error("Failed to update model:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update model" },
      { status: 500 }
    );
  }
}

// DELETE /api/models/[id] - 删除模型
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const d1 = getD1();
    const db = drizzle(d1);

    // 验证所有权并获取文件信息
    const existingModel = await db
      .select()
      .from(models)
      .where(and(eq(models.id, id), eq(models.userId, session.user.id)))
      .limit(1);

    if (existingModel.length === 0) {
      return NextResponse.json(
        { success: false, error: "Model not found or unauthorized" },
        { status: 404 }
      );
    }

    const model = existingModel[0];

    // 删除 R2 中的文件
    try {
      await deleteModelFiles(model.modelFileKey, model.thumbnailKey);
    } catch (e) {
      console.error("Failed to delete R2 files:", e);
      // 继续删除数据库记录
    }

    // 删除数据库记录
    await db.delete(models).where(eq(models.id, id));

    return NextResponse.json({
      success: true,
      message: "Model deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete model:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete model" },
      { status: 500 }
    );
  }
}
