# 🚨 Google 登录 404 问题 - 快速修复指南

## 问题诊断结果

✅ 项目已成功部署到 https://qdesign.cloud
❌ **API 路由返回 404** - 原因：**缺少环境变量配置**

## 立即行动 (3个步骤)

### 🔧 步骤 1: 在 Cloudflare Pages 设置环境变量 (5分钟)

1. **打开以下链接:**
   ```
   https://dash.cloudflare.com/a71ef1050501fcba99b6da6dc4383967/pages/view/qdesign-manager/settings/environment-variables
   ```

2. **点击 "Add variable" 或 "Edit variables"**

3. **逐个添加以下环境变量** (Production 环境):

   **📝 提示：所有密钥值请从你的本地 `.env.local` 文件中复制**

   | 变量名 | 值示例 |
   |--------|-----|
   | `NEXTAUTH_URL` | `https://qdesign.cloud` |
   | `NEXTAUTH_SECRET` | `[从 .env.local 复制]` |
   | `GOOGLE_CLIENT_ID` | `[从 .env.local 复制]` |
   | `GOOGLE_CLIENT_SECRET` | `[从 .env.local 复制]` |
   | `R2_ACCESS_KEY_ID` | `[从 .env.local 复制]` |
   | `R2_SECRET_ACCESS_KEY` | `[从 .env.local 复制]` |
   | `R2_BUCKET_NAME` | `qdesign-models` |
   | `R2_ACCOUNT_ID` | `[从 .env.local 复制]` |
   | `NEXT_PUBLIC_R2_PUBLIC_URL` | `[从 .env.local 复制，格式: https://pub-xxxxx.r2.dev]` |
   | `NEXT_PUBLIC_APP_URL` | `https://qdesign.cloud` |
   | `MAX_FILE_SIZE` | `104857600` |

   **⚠️ 注意:**
   - 同时为 **Production** 和 **Preview** 环境都设置这些变量
   - **不要**设置 `HTTP_PROXY` 和 `HTTPS_PROXY` (仅用于本地开发)

4. **点击 "Save" 保存**

### 🌐 步骤 2: 更新 Google OAuth 回调 URL (2分钟)

1. **打开 Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **找到并点击你的 OAuth 2.0 客户端 ID**

3. **在 "已获授权的重定向 URI" 中添加:**
   ```
   https://qdesign.cloud/api/auth/callback/google
   https://qdesign-manager.pages.dev/api/auth/callback/google
   ```

4. **在 "已获授权的 JavaScript 来源" 中添加:**
   ```
   https://qdesign.cloud
   https://qdesign-manager.pages.dev
   ```

5. **点击 "保存"**

### 🔄 步骤 3: 触发重新部署 (1分钟)

环境变量设置后不会立即生效，需要重新部署。

**选项 A: 使用命令行 (推荐)**
```bash
cd "D:\项目\babylonjs项目\babylonjs编辑器\QDesignManager\QDesignManager"
git commit --allow-empty -m "Add env vars - trigger redeploy"
git push origin main
```

**选项 B: 在 Cloudflare Dashboard 重新部署**
1. 访问: https://dash.cloudflare.com/a71ef1050501fcba99b6da6dc4383967/pages/view/qdesign-manager
2. 进入 "Deployments" 标签
3. 点击最新部署旁的 "⋮" (三个点)
4. 选择 "Retry deployment"

**选项 C: 使用 wrangler CLI**
```bash
cd "D:\项目\babylonjs项目\babylonjs编辑器\QDesignManager\QDesignManager"
npx wrangler pages deploy .open-next --project-name=qdesign-manager
```

## 验证修复

等待部署完成 (约 2-5 分钟)，然后测试：

### ✅ 测试 1: API 路由
```bash
curl -I https://qdesign.cloud/api/auth/providers
# 应该返回: HTTP/1.1 200 OK (而不是 404)
```

### ✅ 测试 2: 登录功能
1. 访问: https://qdesign.cloud/login
2. 点击 "使用 Google 登录"
3. 应该能够成功跳转到 Google 登录页面
4. 登录后应该返回到 dashboard

## 如果还是不行？

### 检查清单:

1. **环境变量是否正确设置？**
   - 在 Cloudflare Pages 设置页面确认所有变量都已添加
   - 确认变量值没有多余的空格或引号

2. **是否重新部署了？**
   - 检查部署时间是否在设置环境变量之后
   - 查看部署日志是否有错误

3. **Google OAuth 配置是否正确？**
   - 确认回调 URL 完全匹配（区分大小写）
   - 确认 OAuth 同意屏幕状态

### 查看部署日志:
```bash
npx wrangler pages deployment tail --project-name=qdesign-manager
```

### 常见错误:

1. **"Invalid credentials"**
   - 检查 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 是否正确

2. **"Callback mismatch"**
   - 确认 Google OAuth 回调 URL 包含 `https://qdesign.cloud/api/auth/callback/google`

3. **仍然返回 404**
   - 确认已重新部署
   - 清除浏览器缓存
   - 等待 Cloudflare CDN 缓存失效 (最多 5 分钟)

## 手动设置环境变量的截图指南

由于无法使用 CLI 批量设置，这是 Cloudflare Dashboard 的步骤：

1. **导航到项目设置**
   - Dashboard → Pages → qdesign-manager → Settings → Environment variables

2. **为每个变量**:
   - 点击 "Add variable"
   - 输入变量名 (例如: `NEXTAUTH_URL`)
   - 输入变量值 (例如: `https://qdesign.cloud`)
   - 选择环境: Production (或两个都选)
   - 点击 "Save"

3. **重复** 直到所有 11 个变量都添加完成

## 预计时间

- ⏱️ 设置环境变量: ~5 分钟
- ⏱️ 更新 Google OAuth: ~2 分钟
- ⏱️ 触发重新部署: ~1 分钟
- ⏱️ 等待部署完成: ~3-5 分钟
- **总计: ~15 分钟**

## 成功标志

完成后，你应该能够：
- ✅ 访问 https://qdesign.cloud/api/auth/providers 看到 JSON 响应
- ✅ 在 https://qdesign.cloud/login 使用 Google 登录
- ✅ 成功进入 dashboard
- ✅ 上传和管理 3D 模型

## 详细文档

查看 `DEPLOYMENT_STATUS.md` 了解完整的技术细节和诊断信息。

---

**最后更新:** 2025-12-26
**状态:** 待修复 - 需要设置环境变量
