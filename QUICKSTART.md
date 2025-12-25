# QDesign Manager 快速配置指南

## 5 分钟快速开始

### 第一步: 配置 Google OAuth

1. 访问 https://console.cloud.google.com/
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭据:
   - 类型: Web 应用
   - 授权重定向 URI: `http://localhost:3000/api/auth/callback/google`
5. 复制 Client ID 和 Client Secret

### 第二步: 配置 Cloudflare R2

1. 访问 https://dash.cloudflare.com/
2. 进入 R2 服务
3. 创建存储桶: `qdesign-models`
4. 设置公开访问（可选）:
   - 连接域名
   - 获取公开 URL (https://pub-xxxxx.r2.dev)
5. 创建 API Token:
   - 权限: 对象读写
   - 复制 Access Key ID 和 Secret Access Key
   - 记录 Account ID

### 第三步: 运行配置脚本

#### Windows:
```bash
scripts\setup-env.bat
```

#### Linux/Mac:
```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

按照提示输入以下信息:
- Google Client ID
- Google Client Secret
- Cloudflare Account ID
- R2 Access Key ID
- R2 Secret Access Key
- R2 Bucket Name
- R2 Public URL

### 第四步: 初始化项目

```bash
# 安装依赖
npm install

# 初始化本地数据库
npx wrangler d1 migrations apply qdesign-db --local

# 启动开发服务器
npm run dev
```

### 第五步: 测试配置

1. 访问 http://localhost:3000
2. 点击 "Google 登录"
3. 使用 Google 账号登录
4. 上传一个 3D 模型测试

## 配置检查清单

- [ ] Google OAuth 已配置
- [ ] Cloudflare R2 存储桶已创建
- [ ] R2 API Token 已创建
- [ ] .env.local 文件已创建
- [ ] 依赖已安装 (npm install)
- [ ] 本地数据库已初始化
- [ ] 开发服务器正常启动
- [ ] Google 登录功能正常
- [ ] 文件上传功能正常

## 必需的环境变量

确保 `.env.local` 中包含以下变量:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[自动生成]

# Google OAuth
GOOGLE_CLIENT_ID=[从 Google Cloud Console 获取]
GOOGLE_CLIENT_SECRET=[从 Google Cloud Console 获取]

# Cloudflare R2
R2_ACCOUNT_ID=[从 Cloudflare Dashboard 获取]
R2_ACCESS_KEY_ID=[从 R2 API Token 获取]
R2_SECRET_ACCESS_KEY=[从 R2 API Token 获取]
R2_BUCKET_NAME=qdesign-models
NEXT_PUBLIC_R2_PUBLIC_URL=[R2 公开访问 URL]

# Database (本地开发)
DATABASE_URL=.wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_FILE_SIZE=104857600
```

## 常见问题快速解决

### Google 登录失败
- 检查 OAuth 重定向 URI 是否为: `http://localhost:3000/api/auth/callback/google`
- 确认 OAuth 同意屏幕已发布或添加了测试用户

### R2 上传失败
- 检查 API Token 权限是否包含"对象读写"
- 确认存储桶名称正确
- 验证 Account ID 正确

### 数据库错误
- 运行: `npx wrangler d1 migrations apply qdesign-db --local`
- 删除 `.wrangler` 目录后重新初始化

## 下一步

配置完成后，您可以:

1. **查看详细文档**: 阅读 [SETUP.md](./SETUP.md) 了解更多配置细节
2. **探索功能**: 尝试上传和管理 3D 模型
3. **自定义配置**: 根据需求调整环境变量
4. **准备部署**: 参考 [SETUP.md](./SETUP.md#部署到生产环境) 部署到生产环境

## 获取帮助

- 详细配置指南: [SETUP.md](./SETUP.md)
- 项目文档: [README.md](./README.md)
- 提交 Issue: [GitHub Issues](https://github.com/your-repo/issues)

---

祝您使用愉快！
