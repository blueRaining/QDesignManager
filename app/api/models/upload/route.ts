import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { uploadModelFile, uploadThumbnail, getFileFromFormData } from "@/lib/r2/upload";
import { MAX_FILE_SIZE, MAX_THUMBNAIL_SIZE, isValidModelFormat, isValidImageFormat } from "@/lib/r2/client";

// POST /api/models/upload - 上传模型文件
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const uploadType = formData.get("type") as string; // 'model' or 'thumbnail'
    const modelId = formData.get("modelId") as string; // 仅用于缩略图上传

    if (uploadType === "thumbnail") {
      // 上传缩略图
      const file = getFileFromFormData(formData, "file");

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided" },
          { status: 400 }
        );
      }

      if (!modelId) {
        return NextResponse.json(
          { success: false, error: "Model ID is required for thumbnail upload" },
          { status: 400 }
        );
      }

      if (!isValidImageFormat(file.name)) {
        return NextResponse.json(
          { success: false, error: "Invalid image format. Supported: jpg, jpeg, png, webp, gif" },
          { status: 400 }
        );
      }

      if (file.size > MAX_THUMBNAIL_SIZE) {
        return NextResponse.json(
          { success: false, error: "Thumbnail size exceeds 5MB limit" },
          { status: 400 }
        );
      }

      const result = await uploadThumbnail(file, modelId);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } else {
      // 上传模型文件
      const file = getFileFromFormData(formData, "file");

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided" },
          { status: 400 }
        );
      }

      if (!isValidModelFormat(file.name)) {
        return NextResponse.json(
          { success: false, error: "Invalid model format. Supported: glb, gltf, fbx, obj, stl, 3ds, dae" },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: "File size exceeds 100MB limit" },
          { status: 400 }
        );
      }

      const result = await uploadModelFile(file, session.user.id);

      return NextResponse.json({
        success: true,
        data: result,
      });
    }
  } catch (error) {
    console.error("Failed to upload file:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to upload file";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
