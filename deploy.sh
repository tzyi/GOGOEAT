#!/bin/bash

# GOGOEAT 部署腳本
echo "🚀 開始部署 GOGOEAT..."

# 檢查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "⚠️  發現未提交的更改，請先提交所有更改"
    git status
    exit 1
fi

# 檢查API金鑰是否已設置
if grep -q "YOUR_API_KEY" index.html; then
    echo "⚠️  請先在 index.html 中設置您的 Google Maps API 金鑰"
    echo "   找到這行：YOUR_API_KEY"
    echo "   替換為您的實際API金鑰"
    exit 1
fi

# 建立部署分支（如果不存在）
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "📝 建立 gh-pages 分支..."
    git checkout -b gh-pages
    git push -u origin gh-pages
    git checkout main
fi

# 切換到部署分支
echo "🔄 切換到 gh-pages 分支..."
git checkout gh-pages

# 合併主分支的更改
echo "🔄 合併主分支更改..."
git merge main --no-edit

# 推送到GitHub
echo "📤 推送到 GitHub..."
git push origin gh-pages

# 切換回主分支
git checkout main

echo "✅ 部署完成！"
echo "🌐 您的網站將在幾分鐘內可用："
echo "   https://your-username.github.io/gogoeat"
echo ""
echo "📋 後續步驟："
echo "1. 前往 GitHub 倉庫設置"
echo "2. 在 Pages 部分確認 source 設為 gh-pages 分支"
echo "3. 等待部署完成（通常需要 1-5 分鐘）"