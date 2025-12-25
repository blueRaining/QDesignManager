@echo off
echo ====================================
echo QDesign Manager 环境配置助手
echo ====================================
echo.

REM 检查是否存在 .env.local 文件
if exist .env.local (
    echo [警告] .env.local 文件已存在
    set /p overwrite="是否覆盖现有文件? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo 操作已取消
        pause
        exit /b
    )
)

echo 正在复制环境变量模板...
copy .env.local.example .env.local

echo.
echo ====================================
echo 开始配置环境变量
echo ====================================
echo.

REM 生成 NextAuth Secret
echo [1/8] 生成 NextAuth Secret...
for /f "delims=" %%i in ('powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))"') do set NEXTAUTH_SECRET=%%i
echo 已生成: %NEXTAUTH_SECRET%

REM 提示用户输入配置
echo.
echo [2/8] Google OAuth 配置
echo 请访问: https://console.cloud.google.com/apis/credentials
set /p GOOGLE_CLIENT_ID="请输入 Google Client ID: "
set /p GOOGLE_CLIENT_SECRET="请输入 Google Client Secret: "

echo.
echo [3/8] Cloudflare R2 配置
echo 请访问: https://dash.cloudflare.com/?to=/:account/r2
set /p R2_ACCOUNT_ID="请输入 Cloudflare Account ID: "
set /p R2_ACCESS_KEY_ID="请输入 R2 Access Key ID: "
set /p R2_SECRET_ACCESS_KEY="请输入 R2 Secret Access Key: "

echo.
echo [4/8] R2 存储桶名称
set /p R2_BUCKET_NAME="请输入 R2 Bucket Name (默认: qdesign-models): "
if "%R2_BUCKET_NAME%"=="" set R2_BUCKET_NAME=qdesign-models

echo.
echo [5/8] R2 公开访问 URL
set /p R2_PUBLIC_URL="请输入 R2 Public URL (例如: https://pub-xxxxx.r2.dev): "

echo.
echo [6/8] NextAuth URL 配置
set /p NEXTAUTH_URL="请输入应用 URL (默认: http://localhost:3000): "
if "%NEXTAUTH_URL%"=="" set NEXTAUTH_URL=http://localhost:3000

echo.
echo [7/8] 应用 URL 配置
set /p APP_URL="请输入公开访问 URL (默认: %NEXTAUTH_URL%): "
if "%APP_URL%"=="" set APP_URL=%NEXTAUTH_URL%

echo.
echo [8/8] 文件大小限制
set /p MAX_FILE_SIZE="请输入最大文件大小(字节) (默认: 104857600 = 100MB): "
if "%MAX_FILE_SIZE%"=="" set MAX_FILE_SIZE=104857600

REM 写入 .env.local 文件
echo.
echo 正在写入配置文件...
(
echo # NextAuth
echo NEXTAUTH_URL=%NEXTAUTH_URL%
echo NEXTAUTH_SECRET=%NEXTAUTH_SECRET%
echo.
echo # Google OAuth
echo GOOGLE_CLIENT_ID=%GOOGLE_CLIENT_ID%
echo GOOGLE_CLIENT_SECRET=%GOOGLE_CLIENT_SECRET%
echo.
echo # Cloudflare D1 ^(本地开发^)
echo DATABASE_URL=.wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite
echo.
echo # Cloudflare R2
echo NEXT_PUBLIC_R2_PUBLIC_URL=%R2_PUBLIC_URL%
echo R2_ACCESS_KEY_ID=%R2_ACCESS_KEY_ID%
echo R2_SECRET_ACCESS_KEY=%R2_SECRET_ACCESS_KEY%
echo R2_BUCKET_NAME=%R2_BUCKET_NAME%
echo R2_ACCOUNT_ID=%R2_ACCOUNT_ID%
echo.
echo # Application
echo NEXT_PUBLIC_APP_URL=%APP_URL%
echo MAX_FILE_SIZE=%MAX_FILE_SIZE%
) > .env.local

echo.
echo ====================================
echo 配置完成！
echo ====================================
echo.
echo 环境变量已保存到 .env.local
echo.
echo 下一步操作:
echo 1. 检查并确认 .env.local 中的配置
echo 2. 运行: npm install
echo 3. 初始化数据库: npx wrangler d1 migrations apply qdesign-db --local
echo 4. 启动开发服务器: npm run dev
echo.
echo 详细配置说明请查看 SETUP.md 文件
echo.
pause
