# QDesign Manager

一个基于 Next.js 15 的 3D 模型管理系统，支持模型上传、预览和管理。使用 Cloudflare R2 存储、D1 数据库和 Google OAuth 认证。

## 特性

- **3D 模型管理**: 上传、预览和管理多种 3D 模型格式（GLB, GLTF, FBX, OBJ 等）
- **实时预览**: 使用 Three.js 和 React Three Fiber 进行 3D 模型预览
- **云存储**: 基于 Cloudflare R2 的高性能对象存储
- **用户认证**: Google OAuth 社交登录
- **现代化 UI**: 基于 Radix UI 和 Tailwind CSS 的响应式界面
- **边缘数据库**: 使用 Cloudflare D1 SQLite 数据库

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 组件**: Radix UI + Tailwind CSS
- **3D 渲染**: React Three Fiber + Three.js
- **认证**: NextAuth.js with Google OAuth
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **存储**: Cloudflare R2 (S3-compatible)
- **开发工具**: TypeScript, ESLint, Wrangler

## 快速开始

### 方法一: 使用配置脚本（推荐）

#### Windows:
```bash
cd scripts
setup-env.bat
```

#### Linux/Mac:
```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

配置脚本会引导您完成以下步骤：
1. 自动生成 NextAuth Secret
2. 配置 Google OAuth 凭据
3. 配置 Cloudflare R2 存储
4. 创建 .env.local 文件

### 方法二: 手动配置

1. **复制环境变量文件**
   ```bash
   cp .env.local.example .env.local
   ```

2. **配置环境变量**

   编辑 `.env.local` 文件，填入以下信息：

   - **Google OAuth**: 从 [Google Cloud Console](https://console.cloud.google.com/) 获取
   - **Cloudflare R2**: 从 [Cloudflare Dashboard](https://dash.cloudflare.com/) 获取
   - **NextAuth Secret**: 运行 `openssl rand -base64 32` 生成

   详细配置步骤请参考 [SETUP.md](./SETUP.md)

3. **安装依赖**
   ```bash
   npm install
   ```

4. **初始化数据库**
   ```bash
   # 本地开发数据库
   npx wrangler d1 migrations apply qdesign-db --local

   # 生产数据库（可选）
   npx wrangler d1 migrations apply qdesign-db --remote
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**

   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
QDesignManager/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/         # NextAuth 认证
│   │   └── models/       # 模型 API
│   ├── dashboard/        # 仪表盘页面
│   ├── login/           # 登录页面
│   └── layout.tsx       # 根布局
├── components/           # React 组件
│   ├── ui/              # UI 基础组件
│   └── model-viewer.tsx # 3D 模型查看器
├── lib/                 # 工具库
│   ├── auth/           # 认证配置
│   ├── db/             # 数据库配置和 Schema
│   └── r2/             # R2 存储客户端
├── drizzle/            # 数据库迁移文件
├── scripts/            # 配置脚本
├── public/             # 静态资源
├── .env.local.example  # 环境变量示例
├── SETUP.md           # 详细配置指南
└── package.json       # 项目依赖
```

## 可用命令

```bash
# 开发
npm run dev          # 启动开发服务器

# 构建
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 代码质量
npm run lint         # 运行 ESLint

# 数据库
npx drizzle-kit generate           # 生成迁移文件
npx wrangler d1 migrations apply   # 应用迁移

# Cloudflare Pages
npx wrangler pages dev             # 本地测试 Pages
npx wrangler pages deploy          # 部署到 Pages
```

## 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXTAUTH_URL` | 应用访问地址 | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth 加密密钥 | 使用 `openssl rand -base64 32` 生成 |
| `GOOGLE_CLIENT_ID` | Google OAuth 客户端 ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 客户端密钥 | `GOCSPX-xxx` |
| `R2_ACCOUNT_ID` | Cloudflare 账号 ID | `xxx` |
| `R2_ACCESS_KEY_ID` | R2 访问密钥 ID | `xxx` |
| `R2_SECRET_ACCESS_KEY` | R2 访问密钥 | `xxx` |
| `R2_BUCKET_NAME` | R2 存储桶名称 | `qdesign-models` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | R2 公开访问 URL | `https://pub-xxx.r2.dev` |

完整的环境变量说明请参考 [.env.local.example](./.env.local.example)

## 支持的文件格式

### 3D 模型
- GLB (推荐)
- GLTF
- FBX
- OBJ
- STL
- 3DS
- DAE (Collada)

### 缩略图
- JPG / JPEG
- PNG
- WebP
- GIF

### 文件大小限制
- 模型文件: 100 MB
- 缩略图: 5 MB

## 部署

### Cloudflare Pages

1. **连接 GitHub 仓库**
   - 登录 Cloudflare Dashboard
   - 选择 Pages > 创建项目
   - 连接您的 GitHub 仓库

2. **配置构建设置**
   ```
   构建命令: npm run build
   输出目录: .next
   ```

3. **添加环境变量**
   - 在 Pages 设置中添加所有必需的环境变量
   - 与 `.env.local` 中的变量相同

4. **绑定 D1 数据库**
   - 在 Pages 设置中绑定 D1 数据库
   - 变量名: `DB`

5. **部署**
   - 推送代码到 GitHub
   - Cloudflare Pages 将自动构建和部署

详细部署说明请参考 [SETUP.md](./SETUP.md#部署到生产环境)

## 开发指南

### 添加新功能

1. **数据库变更**
   ```bash
   # 1. 修改 lib/db/schema.ts
   # 2. 生成迁移
   npx drizzle-kit generate
   # 3. 应用迁移
   npx wrangler d1 migrations apply qdesign-db --local
   ```

2. **API 路由**
   - 在 `app/api/` 目录下创建新的路由
   - 使用 `NextResponse` 返回响应
   - 添加适当的错误处理

3. **组件开发**
   - UI 组件放在 `components/ui/`
   - 业务组件放在 `components/`
   - 使用 TypeScript 定义 Props 类型

### 调试技巧

- 使用 `npm run dev` 启动开发服务器，支持热重载
- 查看浏览器控制台获取客户端错误
- 查看终端输出获取服务器端日志
- 使用 React DevTools 和 Chrome DevTools 进行调试

## 常见问题

查看 [SETUP.md](./SETUP.md#常见问题) 中的常见问题解答。

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至项目维护者

---

**注意**: 本项目使用 Cloudflare 服务，需要 Cloudflare 账号才能完整运行。详细配置说明请查看 [SETUP.md](./SETUP.md)
