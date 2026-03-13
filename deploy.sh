#!/bin/bash

# 坦克游戏自动部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误时停止执行

echo "🚀 开始部署坦克游戏..."

# 配置变量
PROJECT_DIR="/var/www/tank-game"
REPO_URL="https://github.com/6999-web/tank-game-1.git"
BACKUP_DIR="/var/backups/tank-game-$(date +%Y%m%d-%H%M%S)"

# 1. 备份现有项目
echo "📦 备份现有项目..."
if [ -d "$PROJECT_DIR" ]; then
    sudo mkdir -p /var/backups
    sudo cp -r "$PROJECT_DIR" "$BACKUP_DIR"
    echo "✅ 备份完成: $BACKUP_DIR"
fi

# 2. 创建项目目录
echo "📁 创建项目目录..."
sudo mkdir -p "$PROJECT_DIR"
sudo chown -R $USER:$USER "$PROJECT_DIR"
cd "$PROJECT_DIR"

# 3. 克隆或更新代码
echo "📥 获取最新代码..."
if [ -d ".git" ]; then
    # 如果已存在git仓库，拉取最新代码
    git pull origin main
else
    # 否则克隆新仓库
    git clone "$REPO_URL" .
fi

# 4. 安装依赖
echo "📦 安装项目依赖..."
cd tank-game
if [ -f "package.json" ]; then
    npm install
    echo "✅ 依赖安装完成"
fi

# 5. 构建项目（如果需要）
echo "🔨 构建项目..."
if [ -f "package.json" ] && grep -q '"build"' package.json; then
    npm run build
    echo "✅ 项目构建完成"
fi

# 6. 设置文件权限
echo "🔒 设置文件权限..."
sudo chown -R www-data:www-data "$PROJECT_DIR"
sudo chmod -R 755 "$PROJECT_DIR"

# 7. 重启Web服务器
echo "🔄 重启Web服务器..."
if command -v nginx &> /dev/null; then
    sudo nginx -t && sudo systemctl restart nginx
    echo "✅ Nginx重启完成"
fi

echo "🎉 部署完成！"
echo "📍 项目路径: $PROJECT_DIR"
echo "⏰ 备份路径: $BACKUP_DIR"
echo "🌐 访问地址: http://101.33.210.169:33333/"