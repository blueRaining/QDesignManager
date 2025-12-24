"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Model {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  thumbnailUrl: string | null;
  fileFormat: string;
  fileSize: number;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  categoryName: string | null;
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  async function fetchModels() {
    try {
      const res = await fetch("/api/models");
      const data = await res.json();

      if (data.success) {
        setModels(data.data);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("加载模型列表失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个模型吗？此操作不可恢复。")) {
      return;
    }

    try {
      const res = await fetch(`/api/models/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setModels(models.filter((m) => m.id !== id));
      } else {
        alert("删除失败：" + data.error);
      }
    } catch (e) {
      alert("删除失败，请重试");
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的模型</h1>
          <p className="text-gray-500 mt-1">管理您上传的所有 3D 模型</p>
        </div>
        <Link
          href="/dashboard/models/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          上传模型
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {models.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有上传任何模型</h3>
          <p className="text-gray-500 mb-4">开始上传您的第一个 3D 模型</p>
          <Link
            href="/dashboard/models/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            上传模型
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <div key={model.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
              {/* 缩略图 */}
              <div className="aspect-video bg-gray-100 relative">
                {model.thumbnailUrl ? (
                  <Image
                    src={model.thumbnailUrl}
                    alt={model.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}

                {/* 状态徽章 */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      model.isPublic
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {model.isPublic ? "公开" : "私有"}
                  </span>
                </div>

                {/* 操作按钮（悬停显示） */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link
                    href={`/dashboard/models/${model.id}/edit`}
                    className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(model.id)}
                    className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 信息 */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{model.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {model.description || "暂无描述"}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {model.viewCount}
                  </span>
                  <span>{model.fileFormat.toUpperCase()}</span>
                  <span>{formatFileSize(model.fileSize)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
