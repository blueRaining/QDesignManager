import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 客户端配置
export function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

// 上传文件到 R2
export async function uploadToR2(
  client: S3Client,
  key: string,
  body: Buffer | Uint8Array | ReadableStream,
  contentType: string,
  metadata?: Record<string, string>
) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
  });

  await client.send(command);

  // 返回公开 URL
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
}

// 删除 R2 文件
export async function deleteFromR2(client: S3Client, key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  await client.send(command);
}

// 生成预签名 URL（用于下载私有文件）
export async function getSignedDownloadUrl(
  client: S3Client,
  key: string,
  expiresIn: number = 3600
) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
}

// 支持的文件格式
export const SUPPORTED_MODEL_FORMATS = [
  "glb",
  "gltf",
  "fbx",
  "obj",
  "stl",
  "3ds",
  "dae",
] as const;

export const SUPPORTED_IMAGE_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
] as const;

// 文件大小限制（100MB）
export const MAX_FILE_SIZE = 100 * 1024 * 1024;
export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

// 验证文件格式
export function isValidModelFormat(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return SUPPORTED_MODEL_FORMATS.includes(ext as any);
}

export function isValidImageFormat(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return SUPPORTED_IMAGE_FORMATS.includes(ext as any);
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

// MIME 类型映射
export const MIME_TYPES: Record<string, string> = {
  glb: "model/gltf-binary",
  gltf: "model/gltf+json",
  fbx: "application/octet-stream",
  obj: "text/plain",
  stl: "model/stl",
  "3ds": "application/x-3ds",
  dae: "model/vnd.collada+xml",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  return MIME_TYPES[ext] || "application/octet-stream";
}
