// GOGOEAT 配置文件
const CONFIG = {
    // Google Maps API 配置
    GOOGLE_MAPS: {
        API_KEY: 'YOUR_API_KEY', // 請替換為您的Google Maps API金鑰
        DEFAULT_ZOOM: 15,
        DEFAULT_CENTER: { lat: 25.0330, lng: 121.5654 }, // 台北市中心
        MAP_STYLES: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ]
    },

    // 應用程式設定
    APP: {
        NAME: 'GOGOEAT',
        VERSION: '1.0.0',
        DESCRIPTION: '美食地圖應用程式',
        MAX_SEARCH_RESULTS: 50,
        SEARCH_RADIUS: 5000, // 搜尋半徑（公尺）
        AUTO_REFRESH_INTERVAL: 30000 // 自動刷新間隔（毫秒）
    },

    // 篩選器設定
    FILTERS: {
        BUDGET_RANGES: {
            'under100': { min: 0, max: 100, label: '$100 以下' },
            '100-300': { min: 100, max: 300, label: '$100 - $300' },
            '300-500': { min: 300, max: 500, label: '$300 - $500' },
            'over500': { min: 500, max: 9999, label: '$500 以上' }
        },
        RATING_OPTIONS: [
            { value: 4.5, label: '4.5 星以上' },
            { value: 4.0, label: '4.0 星以上' },
            { value: 3.5, label: '3.5 星以上' },
            { value: 0, label: '不限制' }
        ]
    },

    // UI 設定
    UI: {
        ANIMATION_DURATION: 300,
        MODAL_BACKDROP_BLUR: '4px',
        CARD_BORDER_RADIUS: '1.5rem',
        PRIMARY_COLOR: '#FF6B6B',
        SECONDARY_COLOR: '#4ECDC4'
    },

    // 開發模式設定
    DEBUG: {
        ENABLED: false, // 生產環境請設為 false
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        MOCK_DATA: true // 是否使用模擬資料
    }
};

// 導出配置（如果使用模組系統）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}