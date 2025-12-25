#!/bin/bash

echo "===================================="
echo "QDesign Manager 环境配置助手"
echo "===================================="
echo ""

# 检查是否存在 .env.local 文件
if [ -f .env.local ]; then
    echo "[警告] .env.local 文件已存在"
    read -p "是否覆盖现有文件? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "操作已取消"
        exit 0
    fi
fi

echo "正在复制环境变量模板..."
cp .env.local.example .env.local

echo ""
echo "===================================="
echo "开始配置环境变量"
echo "===================================="
echo ""

# 生成 NextAuth Secret
echo "[1/8] 生成 NextAuth Secret..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "已生成: $NEXTAUTH_SECRET"

# 提示用户输入配置
echo ""
echo "[2/8] Google OAuth 配置"
echo "请访问: https://console.cloud.google.com/apis/credentials"
read -p "请输入 Google Client ID: " GOOGLE_CLIENT_ID
read -p "请输入 Google Client Secret: " GOOGLE_CLIENT_SECRET

echo ""
echo "[3/8] Cloudflare R2 配置"
echo "请访问: https://dash.cloudflare.com/?to=/:account/r2"
read -p "请输入 Cloudflare Account ID: " R2_ACCOUNT_ID
read -p "请输入 R2 Access Key ID: " R2_ACCESS_KEY_ID
read -p "请输入 R2 Secret Access Key: " R2_SECRET_ACCESS_KEY

echo ""
echo "[4/8] R2 存储桶名称"
read -p "请输入 R2 Bucket Name (默认: qdesign-models): " R2_BUCKET_NAME
R2_BUCKET_NAME=${R2_BUCKET_NAME:-qdesign-models}

echo ""
echo "[5/8] R2 公开访问 URL"
read -p "请输入 R2 Public URL (例如: https://pub-xxxxx.r2.dev): " R2_PUBLIC_URL

echo ""
echo "[6/8] NextAuth URL 配置"
read -p "请输入应用 URL (默认: http://localhost:3000): " NEXTAUTH_URL
NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}

echo ""
echo "[7/8] 应用 URL 配置"
read -p "请输入公开访问 URL (默认: $NEXTAUTH_URL): " APP_URL
APP_URL=${APP_URL:-$NEXTAUTH_URL}

echo ""
echo "[8/8] 文件大小限制"
read -p "请输入最大文件大小(字节) (默认: 104857600 = 100MB): " MAX_FILE_SIZE
MAX_FILE_SIZE=${MAX_FILE_SIZE:-104857600}

# 写入 .env.local 文件
echo ""
echo "正在写入配置文件..."
cat > .env.local << EOF
# NextAuth
NEXTAUTH_URL=$NEXTAUTH_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Google OAuth
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

# Cloudflare D1 (本地开发)
DATABASE_URL=.wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite

# Cloudflare R2
NEXT_PUBLIC_R2_PUBLIC_URL=$R2_PUBLIC_URL
R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=$R2_BUCKET_NAME
R2_ACCOUNT_ID=$R2_ACCOUNT_ID

# Application
NEXT_PUBLIC_APP_URL=$APP_URL
MAX_FILE_SIZE=$MAX_FILE_SIZE
EOF

echo ""
echo "===================================="
echo "配置完成！"
echo "===================================="
echo ""
echo "环境变量已保存到 .env.local"
echo ""
echo "下一步操作:"
echo "1. 检查并确认 .env.local 中的配置"
echo "2. 运行: npm install"
echo "3. 初始化数据库: npx wrangler d1 migrations apply qdesign-db --local"
echo "4. 启动开发服务器: npm run dev"
echo ""
echo "详细配置说明请查看 SETUP.md 文件"
echo ""
