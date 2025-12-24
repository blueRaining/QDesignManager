"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewModelPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 表单状态
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // 上传结果
  const [modelUploadResult, setModelUploadResult] = useState<{
    key: string;
    url: string;
    size: number;
    format: string;
    originalName: string;
  } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0) {
          setCategoryId(data.data[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch categories:", e);
    }
  }

  const handleModelDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setModelFile(file);
    }
  }, []);

  const handleModelSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setModelFile(file);
    }
  }, []);

  const handleThumbnailSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("请输入模型标题");
      return;
    }

    if (!modelFile) {
      setError("请选择模型文件");
      return;
    }

    if (!categoryId) {
      setError("请选择分类");
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    try {
      // 1. 上传模型文件
      const modelFormData = new FormData();
      modelFormData.append("file", modelFile);
      modelFormData.append("type", "model");

      setUploadProgress(30);

      const modelRes = await fetch("/api/models/upload", {
        method: "POST",
        body: modelFormData,
      });

      const modelData = await modelRes.json();

      if (!modelData.success) {
        throw new Error(modelData.error || "模型上传失败");
      }

      setModelUploadResult(modelData.data);
      setUploadProgress(60);

      // 2. 上传缩略图（如果有）
      let thumbnailKey = null;
      let thumbnailUrl = null;

      if (thumbnailFile) {
        const thumbFormData = new FormData();
        thumbFormData.append("file", thumbnailFile);
        thumbFormData.append("type", "thumbnail");
        thumbFormData.append("modelId", "temp-" + Date.now());

        const thumbRes = await fetch("/api/models/upload", {
          method: "POST",
          body: thumbFormData,
        });

        const thumbData = await thumbRes.json();

        if (thumbData.success) {
          thumbnailKey = thumbData.data.key;
          thumbnailUrl = thumbData.data.url;
        }
      }

      setUploadProgress(80);

      // 3. 创建模型记录
      const createRes = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          categoryId,
          isPublic,
          modelFileKey: modelData.data.key,
          modelFileUrl: modelData.data.url,
          fileSize: modelData.data.size,
          fileFormat: modelData.data.format,
          originalFileName: modelData.data.originalName,
          thumbnailKey,
          thumbnailUrl,
        }),
      });

      const createData = await createRes.json();

      if (!createData.success) {
        throw new Error(createData.error || "创建模型失败");
      }

      setUploadProgress(100);

      // 成功后跳转
      router.push("/dashboard/models");
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败，请重试");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">上传新模型</h1>
        <p className="text-gray-500 mt-1">支持 GLB, GLTF, FBX, OBJ, STL 等格式</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 模型文件上传 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            模型文件 <span className="text-red-500">*</span>
          </label>

          <div
            onDrop={handleModelDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              modelFile
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-primary"
            }`}
          >
            {modelFile ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{modelFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(modelFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModelFile(null)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  移除
                </button>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 mb-2">拖拽文件到此处，或点击选择</p>
                <input
                  type="file"
                  accept=".glb,.gltf,.fbx,.obj,.stl,.3ds,.dae"
                  onChange={handleModelSelect}
                  className="hidden"
                  id="model-file"
                />
                <label
                  htmlFor="model-file"
                  className="inline-block px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90"
                >
                  选择文件
                </label>
                <p className="text-xs text-gray-500 mt-3">最大 100MB</p>
              </>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入模型标题"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入模型描述（可选）"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分类 <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="is-public" className="text-sm text-gray-700">
              公开展示（其他用户可以通过 API 访问）
            </label>
          </div>
        </div>

        {/* 缩略图（可选） */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            缩略图（可选）
          </label>

          <div className="flex items-center gap-4">
            {thumbnailFile ? (
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="缩略图预览"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setThumbnailFile(null)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  移除
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleThumbnailSelect}
                  className="hidden"
                  id="thumbnail-file"
                />
                <label
                  htmlFor="thumbnail-file"
                  className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-700"
                >
                  选择图片
                </label>
                <span className="text-sm text-gray-500">JPG, PNG, WebP（最大 5MB）</span>
              </>
            )}
          </div>
        </div>

        {/* 上传进度 */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">上传中...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 提交按钮 */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !modelFile || !title.trim()}
          >
            {loading ? "上传中..." : "上传模型"}
          </button>
        </div>
      </form>
    </div>
  );
}
