# 部署验证和故障排除

## 当前部署状态

✅ **最新部署:**
- 部署 URL: https://e702e9da.qdesign-manager.pages.dev
- 生产域名: https://qdesign.cloud
- 部署时间: 刚刚完成

❌ **问题:** API 路由仍然返回 404

## 根本原因分析

API 路由返回 404 通常只有一个原因：**环境变量未在 Cloudflare Pages 中正确设置**

## 🔍 验证步骤

### 步骤 1: 检查 Cloudflare Pages 环境变量

1. **访问环境变量设置页面:**
   ```
   https://dash.cloudflare.com/a71ef1050501fcba99b6da6dc4383967/pages/view/qdesign-manager/settings/environment-variables
   ```

2. **确认以下变量存在且有值:**

   **Production 环境必须有以下变量:**
   - [x] `NEXTAUTH_URL` = `https://qdesign.cloud`
   - [x] `NEXTAUTH_SECRET` = (32+ 字符的随机字符串)
   - [x] `GOOGLE_CLIENT_ID` = (以 `.apps.googleusercontent.com` 结尾)
   - [x] `GOOGLE_CLIENT_SECRET` = (以 `GOCSPX-` 开头)
   - [x] `R2_ACCESS_KEY_ID`
   - [x] `R2_SECRET_ACCESS_KEY`
   - [x] `R2_BUCKET_NAME` = `qdesign-models`
   - [x] `R2_ACCOUNT_ID`
   - [x] `NEXT_PUBLIC_R2_PUBLIC_URL`
   - [x] `NEXT_PUBLIC_APP_URL` = `https://qdesign.cloud`
   - [x] `MAX_FILE_SIZE` = `104857600`

3. **检查常见错误:**
   - ❌ 变量值前后有多余的空格
   - ❌ 变量值被引号包围（不需要引号）
   - ❌ 变量名拼写错误
   - ❌ 只设置了 Preview 环境，没有设置 Production 环境

### 步骤 2: 如果环境变量不存在或不正确

**从你的本地 `.env.local` 文件复制值：**

```bash
# 在项目目录运行
cat .env.local
```

然后在 Cloudflare Pages Dashboard 中逐个添加这些变量。

**⚠️ 重要提示:**
- 环境变量必须在 **Production** 环境中设置
- 设置完成后，需要**重新部署**才能生效
- 不要设置 `HTTP_PROXY` 和 `HTTPS_PROXY`（这些仅用于本地开发）
- 不要设置 `DATABASE_URL`（Cloudflare Pages 使用 wrangler.toml 中的 D1 绑定）

### 步骤 3: 设置完环境变量后重新部署

有两种方式：

**方式 A: 使用 CLI 重新部署 (立即生效)**
```bash
cd "D:\项目\babylonjs项目\babylonjs编辑器\QDesignManager\QDesignManager"
npx wrangler pages deploy .open-next --project-name=qdesign-manager --branch=main
```

**方式 B: 在 Dashboard 中重新部署**
1. 访问: https://dash.cloudflare.com/a71ef1050501fcba99b6da6dc4383967/pages/view/qdesign-manager
2. 进入 "Deployments" 标签
3. 点击最新部署的 "⋮" → "Retry deployment"

### 步骤 4: 测试 API 路由

等待部署完成后（约1-2分钟），运行：

```bash
# 测试 providers 端点
curl https://qdesign.cloud/api/auth/providers

# 应该返回类似这样的 JSON:
# {"google":{"id":"google","name":"Google","type":"oauth","signinUrl":"...","callbackUrl":"..."}}
```

如果返回 JSON 而不是 404，说明成功！

## 🐛 高级故障排除

### 查看部署日志

```bash
# 实时查看部署日志
npx wrangler pages deployment tail --project-name=qdesign-manager
```

### 检查特定部署的详细信息

1. 访问: https://dash.cloudflare.com/a71ef1050501fcba99b6da6dc4383967/pages/view/qdesign-manager
2. 进入 "Deployments" 标签
3. 点击最新的部署
4. 查看 "Functions" 标签，确认 API 路由是否被识别

### 如果 API 路由仍然 404

这可能是 OpenNext 配置问题。尝试：

1. **重新构建项目:**
   ```bash
   # 删除构建输出
   rm -rf .next .open-next

   # 重新构建
   npm run build

   # 重新部署
   npx wrangler pages deploy .open-next --project-name=qdesign-manager
   ```

2. **检查构建输出:**
   ```bash
   # 确认 API 路由文件存在
   ls -la .open-next/server-functions/default/.next/server/app/api/auth/
   ```

## 📊 预期结果对比

### ❌ 当前状态（错误）
```bash
$ curl -I https://qdesign.cloud/api/auth/providers
HTTP/1.1 404 Not Found
```

### ✅ 正确状态（修复后）
```bash
$ curl -I https://qdesign.cloud/api/auth/providers
HTTP/1.1 200 OK
Content-Type: application/json
```

## 🎯 快速检查清单

在继续之前，请确认：

- [ ] 已在 Cloudflare Pages Dashboard 中设置了**所有** 11 个环境变量
- [ ] 环境变量设置在 **Production** 环境（不只是 Preview）
- [ ] 变量值没有前后空格或引号
- [ ] 已在设置环境变量**之后**重新部署
- [ ] 等待了 1-2 分钟让部署完全生效

## 💡 常见误区

1. **"我在 .env.local 中设置了"** → ❌ 这只对本地有效，部署需要在 Dashboard 设置
2. **"我设置了环境变量但没重新部署"** → ❌ 环境变量只在部署时注入
3. **"我只设置了 Preview 环境"** → ❌ 生产域名使用 Production 环境的变量

## 下一步

1. 如果你还没有设置环境变量，请先设置：
   - 参考 `QUICK_FIX.md` 获取完整的变量列表

2. 设置完成后，运行：
   ```bash
   npm run build
   npx wrangler pages deploy .open-next --project-name=qdesign-manager
   ```

3. 测试：
   ```bash
   curl https://qdesign.cloud/api/auth/providers
   ```

需要帮助？检查 `DEPLOYMENT_STATUS.md` 了解更多技术细节。
