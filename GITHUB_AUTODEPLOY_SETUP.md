# 配置 GitHub 自动部署指南

## 当前状态
- ✅ 代码已推送到 GitHub 仓库: `blueRaining/QDesignManager`
- ✅ Cloudflare Pages 项目已创建: `qdesign-manager`
- ❌ **尚未连接** GitHub 自动部署

## 设置步骤

### 方式 1: 在现有项目中连接 GitHub (推荐)

由于项目已经存在，需要通过以下步骤连接：

1. **访问 Cloudflare Pages Dashboard**
   ```
   https://dash.cloudflare.com/a71ef1050501fcba99b6da6dc4383967/pages/view/qdesign-manager/settings/builds
   ```

2. **在 Build settings 页面:**
   - 查找 "Source" 或 "Build configuration" 部分
   - 点击 "Connect to Git" 或 "Enable source control"

3. **连接 GitHub:**
   - 选择 GitHub 作为 Git provider
   - 授权 Cloudflare Pages 访问你的 GitHub 账号
   - 选择仓库: `blueRaining/QDesignManager`
   - 选择分支: `main`

4. **配置构建设置:**
   - Build command: `npm run build`
   - Build output directory: `.open-next`
   - Root directory: `/` (保持默认)

5. **保存并部署**
   - 点击 "Save and Deploy"
   - 第一次部署会立即开始

### 方式 2: 删除并重新创建项目 (不推荐，会丢失当前配置)

如果方式1不行，可以：

1. 删除当前项目
2. 在 Cloudflare Pages Dashboard 点击 "Create a project"
3. 选择 "Connect to Git"
4. 按照向导连接 GitHub 并选择仓库

**⚠️ 注意：** 这种方式需要重新配置所有环境变量！

### 方式 3: 使用 Wrangler CLI 手动部署 (临时方案)

在配置自动部署之前，可以先手动部署测试：

```bash
# 1. 构建项目
npm run build

# 2. 部署到 Cloudflare Pages
npx wrangler pages deploy .open-next --project-name=qdesign-manager --branch=main
```

## 自动部署流程

连接 GitHub 后，每次你 push 代码到 main 分支时：
1. Cloudflare Pages 自动检测到新的 commit
2. 自动运行 `npm run build`
3. 自动部署 `.open-next` 目录
4. 部署完成后更新生产环境

## 验证连接

连接成功后，在 Cloudflare Pages 项目页面应该能看到：
- Git Provider: GitHub
- Repository: blueRaining/QDesignManager
- Branch: main
- 最新的部署来源显示为 commit hash (例如: c1c4c3e)

## 常见问题

### Q: 为什么我的项目显示 "Git Provider: No"？
A: 这是因为项目是通过 CLI 手动部署创建的，而不是通过 Git 连接创建的。需要在 Dashboard 中手动连接 Git。

### Q: 连接 GitHub 后会立即部署吗？
A: 是的，第一次连接时会触发一次部署。

### Q: 环境变量会丢失吗？
A: 不会，环境变量配置是项目级别的，与部署方式无关。

### Q: 可以同时使用手动部署和自动部署吗？
A: 连接 Git 后，建议只使用自动部署（通过 push），手动部署可能会造成混乱。

## 下一步

连接 GitHub 后：
1. ✅ 确认自动部署已触发
2. ✅ 等待部署完成（约3-5分钟）
3. ✅ 测试 API 路由: `https://qdesign.cloud/api/auth/providers`
4. ✅ 测试 Google 登录功能

---

**提示：** 如果在 Dashboard 找不到 "Connect to Git" 选项，请尝试方式3先手动部署一次，这样可以立即测试环境变量是否正确设置。
