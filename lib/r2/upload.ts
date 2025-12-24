import { nanoid } from "nanoid";
import {
  createR2Client,
  uploadToR2,
  deleteFromR2,
  getFileExtension,
  getMimeType,
  isValidModelFormat,
  isValidImageFormat,
  MAX_FILE_SIZE,
  MAX_THUMBNAIL_SIZE,
} from "./client";

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  format: string;
  originalName: string;
}

export interface UploadError {
  code: string;
  message: string;
}

// 上传模型文件
export async function uploadModelFile(
  file: File,
  userId: string
): Promise<UploadResult> {
  // 验证文件格式
  if (!isValidModelFormat(file.name)) {
    throw new Error("INVALID_FORMAT: 不支持的文件格式");
  }

  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("FILE_TOO_LARGE: 文件大小超过 100MB 限制");
  }

  const ext = getFileExtension(file.name);
  const key = `models/${userId}/${nanoid()}.${ext}`;

  const client = createR2Client();
  const buffer = await file.arrayBuffer();

  const url = await uploadToR2(
    client,
    key,
    new Uint8Array(buffer),
    getMimeType(file.name),
    {
      userId,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    }
  );

  return {
    key,
    url,
    size: file.size,
    format: ext,
    originalName: file.name,
  };
}

// 上传缩略图
export async function uploadThumbnail(
  file: File,
  modelId: string
): Promise<UploadResult> {
  // 验证文件格式
  if (!isValidImageFormat(file.name)) {
    throw new Error("INVALID_FORMAT: 不支持的图片格式");
  }

  // 验证文件大小
  if (file.size > MAX_THUMBNAIL_SIZE) {
    throw new Error("FILE_TOO_LARGE: 缩略图大小超过 5MB 限制");
  }

  const ext = getFileExtension(file.name);
  const key = `thumbnails/${modelId}.${ext}`;

  const client = createR2Client();
  const buffer = await file.arrayBuffer();

  const url = await uploadToR2(
    client,
    key,
    new Uint8Array(buffer),
    getMimeType(file.name),
    {
      modelId,
      uploadedAt: new Date().toISOString(),
    }
  );

  return {
    key,
    url,
    size: file.size,
    format: ext,
    originalName: file.name,
  };
}

// 删除文件
export async function deleteFile(key: string): Promise<void> {
  const client = createR2Client();
  await deleteFromR2(client, key);
}

// 删除模型相关的所有文件（模型 + 缩略图）
export async function deleteModelFiles(
  modelKey: string,
  thumbnailKey?: string | null
): Promise<void> {
  const client = createR2Client();

  // 删除模型文件
  await deleteFromR2(client, modelKey);

  // 删除缩略图（如果存在）
  if (thumbnailKey) {
    try {
      await deleteFromR2(client, thumbnailKey);
    } catch (e) {
      // 缩略图不存在时忽略错误
      console.warn("Failed to delete thumbnail:", e);
    }
  }
}

// 从 FormData 获取文件
export function getFileFromFormData(
  formData: FormData,
  fieldName: string
): File | null {
  const file = formData.get(fieldName);
  if (file instanceof File && file.size > 0) {
    return file;
  }
  return null;
}
