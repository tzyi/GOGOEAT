# GOGOEAT 🍽️

基於React和Vite的現代化美食地圖應用，使用Google Maps API幫助用戶快速找到附近符合預算和喜好的餐廳。

## ✨ 功能特色

- 🗺️ **互動地圖**：Google Maps整合，視覺化餐廳位置
- 📍 **智能定位**：自動獲取用戶位置顯示附近餐廳
- 💰 **預算篩選**：多段式預算區間篩選功能
- ⭐ **評分系統**：按照餐廳評分進行精準篩選
- 🎲 **隨機推薦**：「今晚吃什麼」解決選擇困難症
- 🔍 **即時搜尋**：餐廳名稱和料理類型即時搜尋
- 📱 **響應式設計**：完美適配手機、平板和桌面
- 🎨 **客製化主題**：Tailwind CSS自訂色彩系統

## 🚀 技術架構

### 核心技術
- **React 18**：現代化前端框架 + Hooks
- **Vite**：極速開發構建工具
- **Tailwind CSS**：原子化CSS框架
- **Google Maps API**：地圖服務和定位功能

### 開發工具
- **@googlemaps/react-wrapper**：React Google Maps整合
- **PostCSS**：CSS後處理器
- **ESLint**：代碼品質檢查

## 📂 專案架構

```
GOGOEAT/
├── index.html              # Vite入口頁面
├── vite.config.js          # Vite配置
├── tailwind.config.js      # Tailwind設定
├── postcss.config.js       # PostCSS配置
├── public/
│   ├── manifest.json       # PWA設定
│   └── ...                 # 靜態資源
├── src/
│   ├── components/         # React組件
│   │   ├── MapContainer.js     # 地圖容器
│   │   ├── SearchBar.js        # 搜尋列
│   │   ├── BudgetModal.js      # 預算篩選
│   │   ├── RatingModal.js      # 評分篩選
│   │   ├── RestaurantCard.js   # 餐廳卡片
│   │   └── RandomModal.js      # 隨機推薦
│   ├── data/
│   │   └── restaurants.js      # 餐廳資料
│   ├── utils/
│   │   └── mapUtils.js         # 地圖工具函數
│   ├── App.js              # 主應用組件
│   ├── App.css             # 應用樣式
│   ├── index.js            # React入口
│   └── index.css           # 全域樣式
├── .env.example            # 環境變數範例
└── package.json            # 專案配置
```

## ⚡ 快速開始

### 1. 環境需求

- Node.js 16+ 
- npm 或 yarn

### 2. 安裝專案

```bash
# 克隆專案
git clone <repository-url>
cd GOGOEAT

# 安裝依賴
npm install
```

### 3. 環境配置

```bash
# 複製環境變數範例
cp .env.example .env
```

編輯 `.env` 並配置您的設定：
```env
# Google Maps API金鑰 (必須)
REACT_APP_GOOGLE_MAP_API_KEY=your_api_key_here

# 應用設定
REACT_APP_NAME=GOGOEAT
REACT_APP_VERSION=1.0.0

# 預設地圖中心 (台北市)
REACT_APP_DEFAULT_LAT=25.0330
REACT_APP_DEFAULT_LNG=121.5654
REACT_APP_DEFAULT_ZOOM=15
```

### 4. Google Maps API設置

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用必要的API服務：
   - **Maps JavaScript API** - 地圖顯示
   - **Places API** - 地點搜尋和詳細資訊
   - **Geolocation API** - 使用者定位
4. 建立API金鑰並設定使用限制
5. 設定HTTP referrer限制提升安全性

### 5. 啟動開發環境

```bash
npm run dev
```

應用將在 `http://localhost:3000` 啟動並自動開啟瀏覽器

## 🛠️ 開發指令

```bash
npm run dev      # 啟動Vite開發服務器 (HMR)
npm run build    # 建置生產版本到 dist/
npm run preview  # 預覽生產版本 (需先build)
npm run deploy   # 部署到GitHub Pages
```

## 🎨 設計系統

### 色彩配置 (Tailwind)
```javascript
colors: {
  primary: '#FF6B6B',    // 珊瑚紅 - 主要按鈕和重點
  secondary: '#4ECDC4',  // 青綠色 - 次要元素
  accent: '#45B7D1',     // 天藍色 - 強調和連結
  warning: '#FFA726',    // 橙色 - 警告和提示
  success: '#66BB6A'     // 綠色 - 成功狀態
}
```

### 組件設計模式
- **容器組件**：處理狀態邏輯 (`MapContainer`)
- **展示組件**：專注UI渲染 (`RestaurantCard`)
- **模態框組件**：統一彈窗交互 (`*Modal.js`)
- **工具模組**：可重用邏輯 (`mapUtils`)

## 📋 資料模型

### 餐廳資料結構
```javascript
{
  id: 1,
  name: "美食餐廳名稱",
  lat: 25.0330,
  lng: 121.5654,
  rating: 4.5,
  priceRange: "$150-300",
  category: "台式料理",
  phone: "02-1234-5678",
  address: "完整地址",
  hours: "11:00 - 21:00",
  isOpen: true,
  hasParking: true,
  image: "restaurant-image-url",
  reviews: 128,
  description: "餐廳特色描述"
}
```

### 篩選狀態
```javascript
filters: {
  budget: null,        // 'under100', '100-300', '300-500', 'over500'
  rating: null,        // 0, 3.5, 4.0, 4.5
  isOpen: false,       // boolean - 僅顯示營業中
  hasParking: false    // boolean - 有停車位
}
```

## 🚀 部署方案

### GitHub Pages (推薦)
```bash
# 自動部署腳本
npm run deploy
```

### Netlify
1. 連接GitHub倉庫到Netlify
2. 建置設定：
   - **建置命令**：`npm run build`
   - **發布目錄**：`dist`
   - **Node版本**：18
3. 環境變數設定：新增 `REACT_APP_GOOGLE_MAP_API_KEY`

### Vercel
```bash
# 使用Vercel CLI部署
npm i -g vercel
vercel --prod
```

## 🔧 開發注意事項

### Vite特性
- ⚡ 極速冷啟動 (< 1秒)
- 🔥 熱模組替換 (HMR)
- 📦 優化的生產建置
- 🛠️ 豐富的插件生態

### 環境變數
- 必須以 `REACT_APP_` 開頭
- 在 `vite.config.js` 中已配置 `process.env` 支援
- 生產環境需在部署平台設定

## 🤝 貢獻指南

1. Fork 專案到您的GitHub
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 遵循現有的代碼風格和組件模式
4. 確保所有功能在各種裝置上正常運作
5. 提交變更 (`git commit -m 'Add: 新增amazing功能'`)
6. 推送分支 (`git push origin feature/amazing-feature`)
7. 發起 Pull Request

### 開發規範
- 使用 ES6+ 語法和 React Hooks
- 組件名稱使用 PascalCase
- 函數名稱使用 camelCase
- 適當的 PropTypes 或 TypeScript (未來規劃)

## 📄 授權條款

本專案採用 **MIT License** 開源授權

---

**GOGOEAT** - 讓選擇美食變得簡單有趣！ 🍽️✨

*由 Vite 和 React 強力驅動*