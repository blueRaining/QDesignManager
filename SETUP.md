# QDesign Manager 配置指南

本文档将指导您如何配置 QDesign Manager 项目所需的 Cloudflare R2 存储和 Google OAuth 认证。

## 目录
1. [环境准备](#环境准备)
2. [配置 Google OAuth](#配置-google-oauth)
3. [配置 Cloudflare R2](#配置-cloudflare-r2)
4. [配置 Cloudflare D1 数据库](#配置-cloudflare-d1-数据库)
5. [本地开发设置](#本地开发设置)
6. [验证配置](#验证配置)

---

## 环境准备

### 1. 复制环境变量文件

```bash
cp .env.local.example .env.local
```

### 2. 生成 NextAuth Secret

使用以下命令生成一个安全的密钥：

```bash
openssl rand -base64 32
```

将生成的密钥填入 `.env.local` 的 `NEXTAUTH_SECRET` 字段。

---

## 配置 Google OAuth

### 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击顶部的项目选择器，创建新项目
3. 输入项目名称（例如：QDesign Manager）
4. 点击"创建"

### 2. 启用 Google+ API

1. 在左侧菜单中选择"API 和服务" > "启用的 API 和服务"
2. 点击"+ 启用 API 和服务"
3. 搜索 "Google+ API"
4. 点击启用

### 3. 配置 OAuth 同意屏幕

1. 在左侧菜单中选择"API 和服务" > "OAuth 同意屏幕"
2. 选择"外部"用户类型（如果是内部使用，选择"内部"）
3. 点击"创建"
4. 填写必填信息：
   - 应用名称：QDesign Manager
   - 用户支持电子邮件：您的邮箱
   - 开发者联系信息：您的邮箱
5. 点击"保存并继续"
6. 作用域：可以跳过，点击"保存并继续"
7. 测试用户：添加您的测试账号邮箱
8. 点击"保存并继续"

### 4. 创建 OAuth 2.0 客户端 ID

1. 在左侧菜单中选择"API 和服务" > "凭据"
2. 点击"+ 创建凭据" > "OAuth 客户端 ID"
3. 应用类型：选择"Web 应用"
4. 名称：QDesign Manager Web Client
5. 已获授权的 JavaScript 来源：
   ```
   http://localhost:3000
   https://your-domain.com
   ```
6. 已获授权的重定向 URI：
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-domain.com/api/auth/callback/google
   ```
7. 点击"创建"
8. 复制生成的"客户端 ID"和"客户端密钥"

### 5. 更新 .env.local

将获取的凭据填入 `.env.local`：

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 配置 Cloudflare R2

### 1. 创建 Cloudflare 账号

如果没有账号，访问 [Cloudflare](https://dash.cloudflare.com/sign-up) 注册。

### 2. 创建 R2 存储桶

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左侧菜单选择 "R2"
3. 点击 "创建存储桶"
4. 存储桶名称：`qdesign-models`（或其他名称）
5. 位置：选择离您最近的区域
6. 点击 "创建存储桶"

### 3. 配置公开访问（可选）

如果需要公开访问文件：

1. 进入创建的存储桶
2. 点击 "设置" > "公开访问"
3. 点击 "连接域"
4. 可以使用 Cloudflare 提供的 `r2.dev` 域名或自定义域名
5. 记录公开访问域名，例如：`https://pub-xxxxx.r2.dev`

### 4. 创建 API 令牌

1. 在 R2 页面，点击右上角的 "管理 R2 API 令牌"
2. 点击 "创建 API 令牌"
3. 令牌名称：`QDesign Manager API Token`
4. 权限：选择 "对象读写"
5. TTL：选择 "永久"（或根据需要设置）
6. 存储桶：选择刚创建的 `qdesign-models` 存储桶
7. 点击 "创建 API 令牌"
8. 复制生成的：
   - Access Key ID
   - Secret Access Key
   - 记录您的 Account ID（在 R2 概览页面可以看到）

### 5. 更新 .env.local

将 R2 凭据填入 `.env.local`：

```env
# Cloudflare R2
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=qdesign-models
R2_ACCOUNT_ID=your-cloudflare-account-id
```

---

## 配置 Cloudflare D1 数据库

### 1. 创建 D1 数据库（用于生产环境）

在项目根目录执行：

```bash
npx wrangler d1 create qdesign-db
```

这将创建一个 D1 数据库并返回数据库信息。

### 2. 更新 wrangler.toml

创建 `wrangler.toml` 文件（如果不存在）：

```toml
name = "qdesign-manager"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "qdesign-db"
database_id = "your-database-id-from-step-1"
```

### 3. 运行数据库迁移

```bash
# 生成迁移文件
npx drizzle-kit generate

# 应用到本地 D1
npx wrangler d1 migrations apply qdesign-db --local

# 应用到远程 D1
npx wrangler d1 migrations apply qdesign-db --remote
```

---

## 本地开发设置

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发数据库

对于本地开发，项目会使用 `.wrangler` 目录下的 SQLite 数据库。首次运行时需要：

```bash
# 初始化本地数据库
npx wrangler d1 migrations apply qdesign-db --local
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 验证配置

### 1. 测试 Google OAuth

1. 打开浏览器访问 http://localhost:3000/login
2. 点击 Google 登录按钮
3. 使用 Google 账号登录
4. 登录成功后应该跳转到 dashboard 页面

### 2. 测试 R2 上传

1. 登录后进入模型管理页面
2. 尝试上传一个 3D 模型文件（.glb, .gltf 等）
3. 上传成功后应该在列表中看到该模型
4. 检查 R2 存储桶中是否有对应的文件

### 3. 检查环境变量

确保所有必需的环境变量都已正确设置：

```bash
# 检查 .env.local 文件
cat .env.local
```

必需的环境变量：
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ACCOUNT_ID`
- `NEXT_PUBLIC_R2_PUBLIC_URL`

---

## 常见问题

### Google OAuth 登录失败

1. 检查 Redirect URI 是否正确配置
2. 确认 OAuth 同意屏幕状态为"已发布"或添加了测试用户
3. 检查 `.env.local` 中的 Client ID 和 Secret 是否正确

### R2 上传失败

1. 检查 API Token 权限是否包含"对象读写"
2. 确认存储桶名称是否正确
3. 检查 Account ID 是否正确
4. 确认文件大小未超过限制（100MB）

### 数据库连接失败

1. 确认已运行数据库迁移
2. 检查 `wrangler.toml` 配置是否正确
3. 本地开发确保 `.wrangler` 目录存在

---

## 部署到生产环境

### 部署到 Cloudflare Pages

1. 连接 GitHub 仓库
2. 配置构建设置：
   - 构建命令：`npm run build`
   - 输出目录：`.next`
3. 添加环境变量（与 .env.local 相同的变量）
4. 绑定 D1 数据库
5. 部署

详细部署步骤请参考 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)。

---

## 技术栈

- **前端框架**: Next.js 15
- **认证**: NextAuth.js with Google OAuth
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **存储**: Cloudflare R2 (S3-compatible)
- **3D 渲染**: React Three Fiber + Three.js
- **UI**: Radix UI + Tailwind CSS

---

## 支持

如果遇到问题，请检查：
1. 环境变量是否正确配置
2. 所有服务是否正常运行
3. 查看浏览器控制台和终端输出的错误信息

需要帮助？请提交 Issue 或联系开发团队。
