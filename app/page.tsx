"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface Model {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  fileFormat: string;
  viewCount: number;
  categoryName: string | null;
  userName: string | null;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicModels();
  }, []);

  async function fetchPublicModels() {
    try {
      const res = await fetch("/api/models/public?limit=12");
      const data = await res.json();
      if (data.success) {
        setModels(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch models:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="font-semibold text-lg">QDesign</span>
            </div>

            <nav className="flex items-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  进入管理后台
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  登录
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            3D 模型管理平台
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            上传、管理和分享您的 3D 模型。支持 GLB, GLTF, FBX, OBJ 等多种格式。
          </p>
          <div className="flex justify-center gap-4">
            {session ? (
              <Link
                href="/dashboard/models/new"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                上传模型
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                开始使用
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Public Models */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">公开模型</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无公开模型</h3>
              <p className="text-gray-500">成为第一个分享模型的用户</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {models.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.id}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
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
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{model.title}</h3>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                      <span>{model.categoryName || "未分类"}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {model.viewCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>QDesign Manager - 3D 模型管理平台</p>
          <p className="mt-1">Powered by Cloudflare</p>
        </div>
      </footer>
    </div>
  );
}
