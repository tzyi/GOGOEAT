# GOGOEAT 美食地圖

🍽️ 一個基於地理位置的美食搜尋平台，幫助用戶快速找到附近符合預算和喜好的餐廳，並提供隨機推薦功能解決選擇困難症。

## 📱 專案特色

- **智能定位**：自動獲取用戶位置，顯示附近餐廳
- **預算篩選**：根據消費預算快速篩選餐廳
- **評分系統**：按照餐廳評分進行篩選
- **隨機推薦**：「今晚吃什麼」功能解決選擇困難
- **即時搜尋**：支援餐廳名稱和料理類型搜尋
- **響應式設計**：完美適配手機、平板和桌面設備

## 🚀 技術架構

### 前端技術
- **HTML5**：語義化標記結構
- **CSS3**：現代化樣式設計
- **JavaScript (ES6+)**：原生JavaScript，無框架依賴
- **Tailwind CSS**：快速響應式UI開發
- **Font Awesome**：豐富的圖標庫

### 地圖服務
- **Google Maps API**：提供地圖顯示和互動功能
- **Google Places API**：餐廳資訊和評分數據
- **Geolocation API**：用戶定位服務

### 響應式設計
- **Mobile First**：優先考慮手機體驗
- **Breakpoints**：
  - 手機：< 640px
  - 平板：640px - 1024px
  - 桌面：> 1024px

## 📁 專案結構

```
GOGOEAT/
├── index_new.html          # 主要HTML文件
├── app.js                  # 核心JavaScript邏輯
├── README.md              # 專案說明文件
└── assets/                # 靜態資源（可選）
    ├── images/            # 圖片資源
    └── icons/             # 圖標文件
```

## 🛠️ 安裝與設置

### 1. 克隆專案
```bash
git clone https://github.com/your-username/gogoeat.git
cd gogoeat
```

### 2. 獲取Google Maps API金鑰
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用以下API：
   - Maps JavaScript API
   - Places API
   - Geolocation API
4. 創建API金鑰並設置使用限制

### 3. 配置API金鑰
在 `index_new.html` 文件中替換 `YOUR_API_KEY`：
```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&callback=initMap&libraries=places"></script>
```

### 4. 啟動專案
```bash
# 使用Python簡單HTTP服務器
python -m http.server 8000

# 或使用Node.js http-server
npx http-server

# 或直接在瀏覽器中打開 index_new.html
```

## 🎯 核心功能

### 1. 地圖互動
- **縮放控制**：支援滑鼠滾輪和觸控縮放
- **拖拽移動**：自由瀏覽不同區域
- **標記點擊**：點擊餐廳標記查看詳細資訊

### 2. 搜尋與篩選
```javascript
// 搜尋功能
handleSearch(query) {
    const filteredRestaurants = this.restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.category.toLowerCase().includes(query.toLowerCase())
    );
}

// 預算篩選
shouldShowRestaurant(restaurant) {
    if (this.currentFilters.budget) {
        const budgetRanges = {
            'under100': [0, 100],
            '100-300': [100, 300],
            '300-500': [300, 500],
            'over500': [500, 9999]
        };
        // 篩選邏輯...
    }
}
```

### 3. 隨機推薦算法
```javascript
showRandomRestaurant() {
    const availableRestaurants = this.restaurants.filter(restaurant => 
        this.shouldShowRestaurant(restaurant)
    );
    
    const randomRestaurant = availableRestaurants[
        Math.floor(Math.random() * availableRestaurants.length)
    ];
}
```

### 4. 距離計算
```javascript
calculateDistance(pos1, pos2) {
    const R = 6371; // 地球半徑（公里）
    const dLat = this.deg2rad(pos2.lat - pos1.lat);
    const dLng = this.deg2rad(pos2.lng - pos1.lng);
    // Haversine公式計算...
}
```

## 📱 響應式設計實現

### CSS媒體查詢
```css
/* 手機版 */
@media (max-width: 640px) {
    .floating-card {
        margin: 0.5rem;
    }
    
    .search-container {
        flex-direction: column;
        gap: 0.5rem;
    }
}

/* 小螢幕手機 */
@media (max-width: 480px) {
    .logo-text {
        font-size: 1.125rem;
    }
    
    .filter-btn {
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
    }
}
```

### Tailwind CSS響應式類別
```html
<!-- 響應式按鈕 -->
<button class="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm">
    <span class="hidden sm:inline">今晚吃什麼</span>
    <span class="sm:hidden">推薦</span>
</button>

<!-- 響應式圖標 -->
<div class="w-6 h-6 sm:w-8 sm:h-8">
    <i class="text-xs sm:text-sm"></i>
</div>
```

## 🎨 UI/UX設計原則

### 色彩系統
```javascript
colors: {
    primary: '#FF6B6B',    // 主色調（珊瑚紅）
    secondary: '#4ECDC4',  // 次要色（青綠色）
    accent: '#45B7D1',     // 強調色（天藍色）
    warning: '#FFA726',    // 警告色（橙色）
    success: '#66BB6A'     // 成功色（綠色）
}
```

### 設計特色
- **毛玻璃效果**：`backdrop-filter: blur(10px)`
- **圓角設計**：統一使用 `rounded-xl` 和 `rounded-2xl`
- **陰影層次**：`box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1)`
- **動畫效果**：滑入動畫和過渡效果

## 🔧 API整合

### Google Maps初始化
```javascript
initMap() {
    const mapOptions = {
        zoom: 15,
        center: this.userLocation,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    };
    
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
}
```

### 自定義標記
```javascript
const marker = new google.maps.Marker({
    position: { lat: restaurant.lat, lng: restaurant.lng },
    map: this.map,
    title: restaurant.name,
    icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="#FF6B6B"/>
                <path d="M12 10h2v12h-2zm4-2h2v14h-2zm4 4h2v10h-2z" fill="white"/>
            </svg>
        `),
        scaledSize: new google.maps.Size(32, 32)
    }
});
```

## 📊 資料結構

### 餐廳資料模型
```javascript
{
    id: 1,
    name: "阿明牛肉麵",
    lat: 25.0330,
    lng: 121.5654,
    rating: 4.5,
    priceRange: "$150-300",
    category: "台式料理",
    phone: "02-2345-6789",
    address: "台北市大安區忠孝東路四段123號",
    hours: "11:00 - 21:00",
    isOpen: true,
    hasParking: true,
    image: "restaurant-image-url",
    reviews: 128
}
```

### 篩選器狀態
```javascript
currentFilters: {
    budget: null,        // 'under100', '100-300', '300-500', 'over500'
    rating: null,        // 0, 3.5, 4.0, 4.5
    isOpen: false,       // boolean
    hasParking: false    // boolean
}
```

## 🚀 部署指南

### GitHub Pages部署
1. 推送代碼到GitHub倉庫
2. 進入倉庫設置頁面
3. 在Pages部分選擇source branch
4. 訪問 `https://username.github.io/gogoeat`

### Netlify部署
1. 連接GitHub倉庫到Netlify
2. 設置構建命令（如果需要）
3. 配置環境變數（API金鑰）
4. 自動部署

### Vercel部署
```bash
npm i -g vercel
vercel --prod
```

## 🔒 安全性考慮

### API金鑰保護
- 設置HTTP referrer限制
- 啟用API使用配額
- 定期輪換API金鑰

### 用戶隱私
- 僅在用戶同意後獲取位置
- 不儲存用戶位置資訊
- 遵循GDPR和相關隱私法規

## 🧪 測試

### 功能測試清單
- [ ] 地圖正常載入
- [ ] 定位功能正常
- [ ] 搜尋功能正常
- [ ] 篩選器正常運作
- [ ] 隨機推薦功能
- [ ] 響應式設計在各設備正常
- [ ] 模態框正常開關

### 瀏覽器兼容性
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🔮 未來功能規劃

### 短期目標
- [ ] 用戶評論系統
- [ ] 收藏餐廳功能
- [ ] 路線規劃整合
- [ ] 多語言支援

### 長期目標
- [ ] 用戶帳號系統
- [ ] 社交分享功能
- [ ] 餐廳預訂整合
- [ ] AI推薦算法
- [ ] 離線地圖支援

## 🤝 貢獻指南

### 開發流程
1. Fork專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟Pull Request

### 代碼規範
- 使用ES6+語法
- 遵循JavaScript Standard Style
- 添加適當的註釋
- 確保響應式設計

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 👥 開發團隊

- **專案負責人**：[Your Name]
- **UI/UX設計**：[Designer Name]
- **前端開發**：[Developer Name]

## 📞 聯絡資訊

- **Email**：contact@gogoeat.com
- **GitHub**：https://github.com/your-username/gogoeat
- **Demo**：https://gogoeat-demo.netlify.app

## 🙏 致謝

- Google Maps API提供地圖服務
- Tailwind CSS提供UI框架
- Font Awesome提供圖標庫
- 所有貢獻者和測試用戶

---

**GOGOEAT** - 讓選擇美食變得簡單有趣！ 🍽️✨