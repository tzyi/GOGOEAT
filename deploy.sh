#!/bin/bash

# GOGOEAT React版本部署腳本
echo "🚀 開始部署 GOGOEAT React版本..."

# 檢查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "⚠️  發現未提交的更改，請先提交所有更改"
    git status
    exit 1
fi

# 檢查環境變數文件
if [ ! -f ".env" ]; then
    echo "⚠️  找不到 .env 文件，請先創建並設置環境變數"
    echo "   複製 .env.example 為 .env 並填入您的 Google Maps API 金鑰"
    exit 1
fi

# 檢查API金鑰是否已設置
if grep -q "your_actual_google_maps_api_key_here" .env; then
    echo "⚠️  請在 .env 文件中設置您的 Google Maps API 金鑰"
    echo "   編輯 .env 文件並替換 your_actual_google_maps_api_key_here"
    exit 1
fi

# 安裝依賴
echo "📦 安裝依賴..."
npm install

# 建置專案
echo "🔨 建置專案..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 建置失敗，請檢查錯誤信息"
    exit 1
fi

# 部署到GitHub Pages
echo "📤 部署到 GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ 部署完成！"
    echo "🌐 您的網站將在幾分鐘內可用："
    echo "   https://your-username.github.io/gogoeat-react"
    echo ""
    echo "📋 後續步驟："
    echo "1. 前往 GitHub 倉庫設置"
    echo "2. 在 Pages 部分確認 source 設為 gh-pages 分支"
    echo "3. 等待部署完成（通常需要 1-5 分鐘）"
else
    echo "❌ 部署失敗，請檢查錯誤信息"
    exit 1
fi