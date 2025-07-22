// 地圖相關工具函數

/**
 * 計算兩點之間的距離（使用Haversine公式）
 * @param {Object} pos1 - 第一個位置 {lat, lng}
 * @param {Object} pos2 - 第二個位置 {lat, lng}
 * @returns {number} 距離（公里）
 */
export const calculateDistance = (pos1, pos2) => {
  const R = 6371; // 地球半徑（公里）
  const dLat = deg2rad(pos2.lat - pos1.lat);
  const dLng = deg2rad(pos2.lng - pos1.lng);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(pos1.lat)) * Math.cos(deg2rad(pos2.lat)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * 將度數轉換為弧度
 * @param {number} deg - 度數
 * @returns {number} 弧度
 */
const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

/**
 * 創建自定義餐廳標記圖標
 * @param {string} color - 標記顏色
 * @returns {string} SVG圖標的Data URL
 */
export const createRestaurantMarkerIcon = (color = '#FF6B6B') => {
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
      <path d="M12 10h2v12h-2zm4-2h2v14h-2zm4 4h2v10h-2z" fill="white"/>
    </svg>
  `);
};

/**
 * 創建用戶位置標記圖標
 * @returns {string} SVG圖標的Data URL
 */
export const createUserLocationIcon = () => {
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#45B7D1" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `);
};

/**
 * 獲取地圖樣式配置
 * @returns {Array} Google Maps樣式配置
 */
export const getMapStyles = () => {
  return [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ];
};

/**
 * 獲取地圖預設配置
 * @param {Object} center - 地圖中心點 {lat, lng}
 * @param {number} zoom - 縮放級別
 * @returns {Object} Google Maps配置對象
 */
export const getMapConfig = (center, zoom = 15) => {
  return {
    zoom,
    center,
    styles: getMapStyles(),
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: window.google?.maps?.ControlPosition?.RIGHT_CENTER
    }
  };
};

/**
 * 檢查瀏覽器是否支援地理位置API
 * @returns {boolean} 是否支援
 */
export const isGeolocationSupported = () => {
  return 'geolocation' in navigator;
};

/**
 * 獲取用戶當前位置
 * @returns {Promise<Object>} 位置對象 {lat, lng}
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('瀏覽器不支援地理位置API'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5分鐘緩存
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = '定位失敗';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用戶拒絕了定位請求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '定位請求超時';
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * 格式化距離顯示
 * @param {number} distance - 距離（公里）
 * @returns {string} 格式化的距離字符串
 */
export const formatDistance = (distance) => {
  if (distance < 0.1) {
    return '<100m';
  } else if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
};

/**
 * 檢查點是否在指定半徑內
 * @param {Object} center - 中心點 {lat, lng}
 * @param {Object} point - 檢查點 {lat, lng}
 * @param {number} radius - 半徑（公里）
 * @returns {boolean} 是否在範圍內
 */
export const isWithinRadius = (center, point, radius) => {
  const distance = calculateDistance(center, point);
  return distance <= radius;
};