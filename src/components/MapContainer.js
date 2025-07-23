import React, { useState, useEffect, useRef } from 'react';
import SearchBar from './SearchBar';
import RestaurantCard from './RestaurantCard';
import BudgetModal from './BudgetModal';
import RatingModal from './RatingModal';
import RandomModal from './RandomModal';
import { calculateDistance } from '../utils/mapUtils';

// 計算兩點間距離（米）
const calculateDistanceInMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // 地球半徑（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const MapContainer = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [randomRestaurant, setRandomRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [placesService, setPlacesService] = useState(null);
  const [filters, setFilters] = useState({
    budget: null,
    rating: null,
    isOpen: false,
    hasParking: false
  });
  const [modals, setModals] = useState({
    budget: false,
    rating: false,
    restaurant: false,
    random: false
  });
  const [searchQuery, setSearchQuery] = useState('');

  const input = document.getElementById("search-input");
  const searchBox = new google.maps.places.SearchBox(input);

  // 等待Google Maps API載入
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    
    if (!map) {
      checkGoogleMaps();
    }
  }, []);

  // 初始化地圖
  const initializeMap = () => {
    if (mapRef.current && !map) {
      const defaultLocation = {
        lat: parseFloat(import.meta.env.VITE_DEFAULT_LAT) || 25.0330,
        lng: parseFloat(import.meta.env.VITE_DEFAULT_LNG) || 121.5654
      };

      try {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          zoom: parseInt(import.meta.env.VITE_DEFAULT_ZOOM) || 15,
          center: defaultLocation,
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
        });

        setMap(mapInstance);
        
        // 初始化 Places Service (如果可用)
        if (window.google.maps.places) {
          const service = new window.google.maps.places.PlacesService(mapInstance);
          setPlacesService(service);
        }
        
        // 初始化 Places Autocomplete Service
        if (window.google.maps.places && window.google.maps.places.AutocompleteService) {
          console.log('Places Autocomplete Service 可用');
        }
        
        getCurrentLocation(mapInstance, defaultLocation);
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
      }
    }
  };

  // 獲取用戶位置
  const getCurrentLocation = (mapInstance, defaultLocation) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          mapInstance.setCenter(location);
          addUserMarker(mapInstance, location);
        },
        (error) => {
          console.error('定位失敗:', error);
          setUserLocation(defaultLocation);
          addUserMarker(mapInstance, defaultLocation);
        }
      );
    } else {
      setUserLocation(defaultLocation);
      addUserMarker(mapInstance, defaultLocation);
    }
  };

  // 添加用戶位置標記
  const addUserMarker = (mapInstance, location) => {
    new window.google.maps.Marker({
      position: location,
      map: mapInstance,
      title: '您的位置',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#45B7D1" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
      }
    });
  };

  // 搜尋附近餐廳
  const searchNearbyRestaurants = (location, query = '') => {
    console.log('搜尋附近餐廳:', { location, query, placesService });
    
    if (!placesService || !location) {
      console.log('缺少必要參數:', { placesService: !!placesService, location: !!location });
      return;
    }

    const request = {
      location: location,
      radius: 2000, // 2公里範圍
      type: ['restaurant'],
      keyword: query || 'restaurant'
    };

    console.log('附近搜尋請求:', request);

    placesService.nearbySearch(request, (results, status) => {
      console.log('附近搜尋結果:', { results, status });
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        console.log('附近搜尋成功，找到', results.length, '個餐廳');
        
        const restaurantData = results.map((place, index) => ({
          id: place.place_id || index,
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          rating: place.rating || 0,
          priceLevel: place.price_level || 0,
          isOpen: place.opening_hours?.open_now ?? true,
          address: place.vicinity,
          placeId: place.place_id,
          photos: place.photos || [],
          types: place.types || []
        }));
        
        console.log('設置附近餐廳到 restaurants state');
        setRestaurants(restaurantData);
        
        // 直接添加標記，不依賴 useEffect
        console.log('直接添加附近餐廳標記');
        addRestaurantMarkers(restaurantData);
      } else {
        console.error('附近搜尋失敗:', status);
      }
    });
  };

  // 添加餐廳標記
  useEffect(() => {
    if (map && userLocation && placesService) {
      searchNearbyRestaurants(userLocation);
    }
  }, [map, userLocation, placesService]);

  // 當篩選條件或搜尋關鍵字改變時更新標記
  useEffect(() => {
    if (restaurants.length > 0) {
      addRestaurantMarkers();
    }
  }, [filters, searchQuery]);

  const addRestaurantMarkers = (restaurantData = restaurants) => {
    console.log('添加餐廳標記:', { restaurantData, map });
    
    if (!map) {
      console.log('地圖尚未初始化');
      return;
    }
    
    // 清除現有標記
    markers.forEach(marker => marker.setMap(null));
    
    const filteredRestaurants = getFilteredRestaurants(restaurantData);
    console.log('篩選後的餐廳:', filteredRestaurants);
    
    const newMarkers = [];

    filteredRestaurants.forEach((restaurant, index) => {
      console.log(`創建標記 ${index + 1}:`, restaurant);
      
      try {
        const marker = new window.google.maps.Marker({
          position: { lat: restaurant.lat, lng: restaurant.lng },
          map: map,
          title: restaurant.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#FF6B6B" stroke="white" stroke-width="2"/>
                <path d="M12 10h2v12h-2zm4-2h2v14h-2zm4 4h2v10h-2z" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });

        marker.addListener('click', () => {
          // 獲取詳細資訊
          getPlaceDetails(restaurant.placeId, (details) => {
            setSelectedRestaurant({
              ...restaurant,
              ...details
            });
            openModal('restaurant');
          });
        });

        newMarkers.push(marker);
        console.log(`標記 ${index + 1} 創建成功`);
      } catch (error) {
        console.error(`創建標記 ${index + 1} 失敗:`, error);
      }
    });

    console.log('設置新標記:', newMarkers.length);
    setMarkers(newMarkers);
  };

  // 獲取餐廳詳細資訊
  const getPlaceDetails = (placeId, callback) => {
    if (!placesService || !placeId) return;

    const request = {
      placeId: placeId,
      fields: ['name', 'rating', 'reviews', 'formatted_phone_number', 'opening_hours', 'website', 'photos', 'price_level', 'formatted_address']
    };

    placesService.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const details = {
          phone: place.formatted_phone_number || '',
          website: place.website || '',
          hours: place.opening_hours?.weekday_text?.join('<br>') || '',
          photos: place.photos || [],
          reviews: place.reviews || [],
          priceLevel: place.price_level || 0,
          fullAddress: place.formatted_address || ''
        };
        callback(details);
      }
    });
  };

  // 篩選餐廳
  const getFilteredRestaurants = (restaurantData = restaurants) => {
    console.log('開始篩選餐廳:', { restaurantData, searchQuery, filters });
    
    const filtered = restaurantData.filter(restaurant => {
      // 搜尋篩選 - 只在有 searchQuery 且不是從搜尋結果來的時候才篩選
      if (searchQuery && restaurantData === restaurants) {
        const query = searchQuery.toLowerCase();
        if (!restaurant.name.toLowerCase().includes(query) && 
            !restaurant.types.some(type => type.toLowerCase().includes(query))) {
          console.log('餐廳被搜尋篩選排除:', restaurant.name);
          return false;
        }
      }

      // 評分篩選
      if (filters.rating && restaurant.rating < filters.rating) {
        console.log('餐廳被評分篩選排除:', restaurant.name, '評分:', restaurant.rating);
        return false;
      }

      // 營業狀態篩選
      if (filters.isOpen && !restaurant.isOpen) {
        console.log('餐廳被營業狀態篩選排除:', restaurant.name);
        return false;
      }

      // 價格篩選 (基於 Google Places 的 price_level: 0-4)
      if (filters.budget) {
        const budgetToLevel = {
          'under100': [0, 1],
          '100-300': [1, 2], 
          '300-500': [2, 3],
          'over500': [3, 4]
        };
        
        const levelRange = budgetToLevel[filters.budget];
        if (restaurant.priceLevel < levelRange[0] || restaurant.priceLevel > levelRange[1]) {
          console.log('餐廳被價格篩選排除:', restaurant.name, '價格等級:', restaurant.priceLevel);
          return false;
        }
      }

      return true;
    });
    
    console.log('篩選結果:', filtered.length, '個餐廳');
    return filtered;
  };

  // 模態框控制
  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const closeAllModals = () => {
    setModals({
      budget: false,
      rating: false,
      restaurant: false,
      random: false
    });
  };

  // 隨機推薦
  const handleRandomRecommendation = () => {
    const availableRestaurants = getFilteredRestaurants();
    
    if (availableRestaurants.length === 0) {
      alert('沒有符合條件的餐廳');
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableRestaurants.length);
    const restaurant = availableRestaurants[randomIndex];
    
    // 獲取詳細資訊後顯示
    getPlaceDetails(restaurant.placeId, (details) => {
      setRandomRestaurant({
        ...restaurant,
        ...details
      });
      openModal('random');
    });

    // 在地圖上高亮顯示
    map.setCenter({ lat: restaurant.lat, lng: restaurant.lng });
    map.setZoom(17);
  };

  // 定位到用戶位置
  const handleLocationClick = () => {
    if (userLocation && map) {
      map.setCenter(userLocation);
      map.setZoom(15);
    }
  };

  // 篩選器處理
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value
    }));
  };

  const toggleFilter = (filterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  // 全局函數：處理餐廳詳細資訊
  useEffect(() => {
    window.openRestaurantDetails = (placeId) => {
      console.log('Opening details for:', placeId);
      const restaurant = restaurants.find(r => r.placeId === placeId || r.id === placeId);
      if (restaurant && restaurant.placeId) {
        getPlaceDetails(restaurant.placeId, (details) => {
          setSelectedRestaurant({
            ...restaurant,
            ...details
          });
          openModal('restaurant');
        });
      } else if (restaurant) {
        setSelectedRestaurant(restaurant);
        openModal('restaurant');
      }
    };
    
    return () => {
      delete window.openRestaurantDetails;
    };
  }, [restaurants]);

  // 搜尋提交處理
  const handleSearchSubmit = (query = searchQuery) => {
    // 清除現有標記
    markers.forEach(marker => {
      try {
        marker.setMap(null);
      } catch (e) {
        console.warn('清除標記失敗:', e);
      }
    });

    if (!query || !map || !placesService) return;
    // 執行搜尋邏輯
    console.log('451L');
    const center = map.getCenter();
    const bounds = map.getBounds();
    performMultipleSearches(query, center, bounds, 2000);
  };
    
  // 多輪搜尋機制
  const performMultipleSearches = (query, center, bounds, searchRadius) => {
    const allResults = [];
    let searchesCompleted = 0;
    const totalSearches = 3;
    
    // 搜尋變體：原始查詢、加上地區、加上關鍵字
    const searchQueries = [
      query,
      `${query} 台北`,
      `${query} restaurant`
    ];
    
    const handleSearchComplete = () => {
      searchesCompleted++;
      if (searchesCompleted === totalSearches) {
        console.log('所有搜尋完成，合併結果:', allResults.length);
        
        // 去重：根據 place_id 去重
        const uniqueResults = [];
        const seenIds = new Set();
        
        allResults.forEach(result => {
          const id = result.place_id || `${result.name}_${result.geometry.location.lat()}_${result.geometry.location.lng()}`;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            uniqueResults.push(result);
          }
        });
        
        console.log('去重後結果:', uniqueResults.length);
        
        if (uniqueResults.length > 0) {
          handlePlacesSearchResults(uniqueResults, query, center);
        } else {
          console.log('所有 Places API 搜尋均無結果，降級到 Geocoding API');
          handleGeocodingSearch(query, bounds, center);
        }
      }
    };
    
    // 執行多個搜尋
    searchQueries.forEach((searchQuery, index) => {
      setTimeout(() => {
        const request = {
          query: searchQuery,
          location: center,
          radius: searchRadius,
          fields: ['name', 'geometry', 'place_id', 'rating', 'price_level', 'opening_hours', 'formatted_address', 'vicinity', 'photos', 'types']
        };
        
        console.log(`執行搜尋 ${index + 1}:`, searchQuery);
        
        placesService.textSearch(request, (results, status) => {
          console.log(`搜尋 ${index + 1} 結果:`, { query: searchQuery, status, count: results?.length });
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            allResults.push(...results);
          }
          
          handleSearchComplete();
        });
      }, index * 100); // 避免同時發送太多請求
    });
  };

  // 處理 Places API 搜尋結果
  const handlePlacesSearchResults = (results, query, center) => {
    console.log('handlePlacesSearchResults');
    try {
      console.log('處理 Places API 搜尋結果');
      
      // 清除現有標記
      markers.forEach(marker => {
        try {
          marker.setMap(null);
        } catch (e) {
          console.warn('清除標記失敗:', e);
        }
      });
      
      const newMarkers = [];
      const searchResults = [];
      
      // 計算地圖可見範圍，優先顯示範圍內的結果
      const centerLat = center.lat();
      const centerLng = center.lng();
      const bounds = map.getBounds();
      
      // 將結果分為範圍內和範圍外
      const inBoundsResults = [];
      const outOfBoundsResults = [];
      
      results.forEach(result => {
        try {
          if (!result.geometry || !result.geometry.location) {
            console.warn('結果缺少位置資訊:', result);
            return;
          }
          
          const location = result.geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          if (bounds.contains(location)) {
            inBoundsResults.push(result);
          } else {
            // 對於範圍外的結果，檢查是否在合理距離內
            const distance = calculateDistanceInMeters(centerLat, centerLng, lat, lng);
            if (distance <= 15000) { // 15公里內
              outOfBoundsResults.push(result);
            }
          }
        } catch (e) {
          console.warn('處理結果時出錯:', e, result);
        }
      });
      
      // 按距離排序
      const sortByDistance = (a, b) => {
        try {
          const distA = calculateDistanceInMeters(centerLat, centerLng, 
            a.geometry.location.lat(), a.geometry.location.lng());
          const distB = calculateDistanceInMeters(centerLat, centerLng, 
            b.geometry.location.lat(), b.geometry.location.lng());
          return distA - distB;
        } catch (e) {
          console.warn('排序時出錯:', e);
          return 0;
        }
      };
      
      inBoundsResults.sort(sortByDistance);
      outOfBoundsResults.sort(sortByDistance);
      
      // 合併結果：優先顯示範圍內的，然後是範圍外的
      const nearbyResults = [...inBoundsResults, ...outOfBoundsResults.slice(0, 10)];
      
      console.log('Places 搜尋結果:', {
        總數: results.length,
        範圍內: inBoundsResults.length,
        範圍外: outOfBoundsResults.length,
        顯示: nearbyResults.length
      });
      
      // 增加顯示的結果數量，最多顯示20個
      nearbyResults.slice(0, 20).forEach((place, index) => {
        try {
          const location = place.geometry.location;
          
          const restaurantData = {
            id: place.place_id || `places_${index}`,
            name: place.name || query,
            lat: location.lat(),
            lng: location.lng(),
            rating: place.rating || 0,
            priceLevel: place.price_level || 0,
            isOpen: place.opening_hours?.open_now ?? true,
            address: place.formatted_address || place.vicinity || '',
            placeId: place.place_id,
            photos: place.photos || [],
            types: place.types || ['restaurant']
          };
      
          searchResults.push(restaurantData);
          
          // 創建標記
          const marker = new window.google.maps.Marker({
            position: location,
            map: map,
            title: restaurantData.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#27ae60" stroke="white" stroke-width="2"/>
                  <path d="M12 10h2v12h-2zm4-2h2v14h-2zm4 4h2v10h-2z" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32)
            }
          });

          // 取得圖片網址（若有）
          let photoHTML = "";
          if (place.photos && place.photos.length > 0) {
            const photoUrl = place.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 });
            photoHTML = `
              <div style="width: 280px; height: 160px; overflow: hidden; border-radius: 12px; margin-bottom: 12px;">
                <img src="${photoUrl}" alt="${place.name}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            `;
          }
          
          // 創建評分星星
          const createStars = (rating) => {
            if (!rating || rating === 0) return '';
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            let starsHTML = '';
            
            for (let i = 0; i < 5; i++) {
              if (i < fullStars) {
                starsHTML += '<span style="color: #ffd700;">★</span>';
              } else if (i === fullStars && hasHalfStar) {
                starsHTML += '<span style="color: #ffd700;">☆</span>';
              } else {
                starsHTML += '<span style="color: #ddd;">☆</span>';
              }
            }
            return `<div style="margin: 6px 0;">${starsHTML} <span style="color: #666; font-size: 13px;">(${rating})</span></div>`;
          };
          
          // 創建價格等級顯示
          const createPriceLevel = (level) => {
            if (!level || level === 0) return '';
            const dollarSigns = '$'.repeat(level);
            const grayDollars = '$'.repeat(4 - level);
            return `<div style="margin: 4px 0;"><span style="color: #27ae60;">${dollarSigns}</span><span style="color: #ddd;">${grayDollars}</span></div>`;
          };
          
          // 創建 InfoWindow
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 300px;
                padding: 0;
                margin: 0;
                border-radius: 16px;
                overflow: hidden;
              ">
                ${photoHTML}
                <div style="padding: 16px;">
                  <h3 style="
                    margin: 0 0 8px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #2c3e50;
                    line-height: 1.3;
                  ">${restaurantData.name}</h3>
                  
                  ${createStars(restaurantData.rating)}
                  ${createPriceLevel(restaurantData.priceLevel)}
                  
                  <div style="
                    display: flex;
                    align-items: center;
                    margin: 8px 0;
                    padding: 6px 10px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    border-left: 3px solid #27ae60;
                  ">
                    <span style="color: #27ae60; margin-right: 6px;">📍</span>
                    <span style="color: #666; font-size: 14px; line-height: 1.4;">${restaurantData.address}</span>
                  </div>
                  
                  <div style="
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #eee;
                    text-align: center;
                  ">
                    <button onclick="window.openRestaurantDetails && window.openRestaurantDetails('${restaurantData.placeId || restaurantData.id}')" style="
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      border: none;
                      padding: 8px 16px;
                      border-radius: 20px;
                      font-size: 13px;
                      font-weight: 500;
                      cursor: pointer;
                      transition: transform 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                      查看詳細資訊
                    </button>
                  </div>
                </div>
              </div>
            `
          });
          
          // 點擊標記顯示 InfoWindow
          marker.addListener('click', () => {
            console.log('infoWindow:', infoWindow);
            infoWindow.open(map, marker);
            console.log('629L');
            console.log('restaurantData :', restaurantData);
            infoWindow.open(map, marker);
            
            // 獲取詳細資訊
            // if (restaurantData.placeId) {
            //   getPlaceDetails(restaurantData.placeId, (details) => {
            //     setSelectedRestaurant({
            //       ...restaurantData,
            //       ...details
            //     });
            //     openModal('restaurant');
            //     console.log('640L');
            //   });
            // } else {
            //   setSelectedRestaurant(restaurantData);
            //   openModal('restaurant');
            //   console.log('645L');
            // }

          });
          newMarkers.push(marker);
        } catch (e) {
          console.error('創建標記時出錯:', e, place);
        }
      });
      
      setMarkers(newMarkers);
      setRestaurants(searchResults);
      
      console.log(`已在地圖上顯示 ${newMarkers.length} 個店家搜尋結果`);
      
      // 調整地圖視窗到包含所有結果
      if (searchResults.length > 0) {
        try {
          const resultBounds = new window.google.maps.LatLngBounds();
          searchResults.forEach(result => {
            resultBounds.extend({ lat: result.lat, lng: result.lng });
          });
          map.fitBounds(resultBounds);
        } catch (e) {
          console.warn('調整地圖視窗失敗:', e);
        }
      }
    } catch (error) {
      console.error('處理 Places API 搜尋結果時出錯:', error);
      console.log('降級到 Geocoding API');
      handleGeocodingSearch(query, map.getBounds(), map.getCenter());
    }
  };

  // Geocoding API 搜尋（降級選項）
  const handleGeocodingSearch = (query, bounds, center) => {
    const geocoder = new window.google.maps.Geocoder();
    
    // 構建搜尋地址 - 包含當前區域資訊
    const searchQuery = `${query} near ${center.lat()},${center.lng()}`;
    
    console.log('Geocoding 搜尋:', searchQuery);
    
    geocoder.geocode({
      address: searchQuery,
      componentRestrictions: { country: 'TW' },
      // 限制搜尋在當前地圖範圍內
      bounds: bounds
    }, (results, status) => {
      console.log('Geocoding 搜尋結果:', { results, status, count: results?.length });
      
      if (status === 'OK' && results.length > 0) {
        console.log('搜尋成功，找到', results.length, '個結果');
        
        // 清除現有標記
        markers.forEach(marker => marker.setMap(null));
        
        const newMarkers = [];
        const searchResults = [];
        
        // 篩選在當前地圖範圍內的結果
        const filteredResults = results.filter(result => {
          const location = result.geometry.location;
          return bounds.contains(location);
        });
        
        console.log('範圍內的結果:', filteredResults.length);
        
        // 如果範圍內沒有結果，使用距離排序後的最近結果，但限制在合理範圍內
        let resultsToUse;
        if (filteredResults.length > 0) {
          resultsToUse = filteredResults;
        } else {
          // 計算與地圖中心的距離，只使用合理範圍內的結果
          const centerLat = center.lat();
          const centerLng = center.lng();
          const maxDistance = 10000; // 10公里內
          
          const nearbyResults = results.filter(result => {
            const lat = result.geometry.location.lat();
            const lng = result.geometry.location.lng();
            const distance = calculateDistanceInMeters(centerLat, centerLng, lat, lng);
            return distance <= maxDistance;
          }).sort((a, b) => {
            const distA = calculateDistanceInMeters(centerLat, centerLng, 
              a.geometry.location.lat(), a.geometry.location.lng());
            const distB = calculateDistanceInMeters(centerLat, centerLng, 
              b.geometry.location.lat(), b.geometry.location.lng());
            return distA - distB;
          });
          
          resultsToUse = nearbyResults.slice(0, 5);
          console.log('使用附近結果:', resultsToUse.length, '個');
        }
        
        resultsToUse.forEach((result, index) => {
          const location = result.geometry.location;
          
          // 從地址中提取可能的店名
          let name = query; // 預設使用搜尋關鍵字
          const addressParts = result.formatted_address.split(',');
          if (addressParts.length > 0) {
            // 嘗試從地址第一部分提取店名
            const firstPart = addressParts[0].trim();
            if (firstPart.length > 0 && firstPart !== result.formatted_address) {
              name = firstPart;
            }
          }
          
          const restaurantData = {
            id: result.place_id || `search_${index}`,
            name: name,
            lat: location.lat(),
            lng: location.lng(),
            rating: 0,
            priceLevel: 0,
            isOpen: true,
            address: result.formatted_address,
            placeId: result.place_id,
            photos: [],
            types: result.types || ['restaurant']
          };
          
          searchResults.push(restaurantData);
          
          // 創建標記
          const marker = new window.google.maps.Marker({
            position: location,
            map: map,
            title: restaurantData.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#FF6B6B" stroke="white" stroke-width="2"/>
                  <path d="M12 10h2v12h-2zm4-2h2v14h-2zm4 4h2v10h-2z" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32)
            }
          });
          
          // 創建 InfoWindow
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 300px;
                padding: 16px;
                margin: 0;
                border-radius: 16px;
                overflow: hidden;
              ">
                <h3 style="
                  margin: 0 0 12px 0;
                  font-size: 18px;
                  font-weight: 600;
                  color: #2c3e50;
                  line-height: 1.3;
                ">${restaurantData.name}</h3>
                
                <div style="
                  display: flex;
                  align-items: center;
                  margin: 12px 0;
                  padding: 8px 12px;
                  background-color: #f8f9fa;
                  border-radius: 8px;
                  border-left: 3px solid #3498db;
                ">
                  <span style="color: #3498db; margin-right: 8px;">📍</span>
                  <span style="color: #666; font-size: 14px; line-height: 1.4;">${restaurantData.address}</span>
                </div>
                
                <div style="
                  display: inline-flex;
                  align-items: center;
                  padding: 6px 12px;
                  background-color: #e3f2fd;
                  color: #3498db;
                  border-radius: 8px;
                  font-size: 13px;
                  font-weight: 500;
                  margin: 12px 0;
                ">
                  🔍 搜尋結果
                </div>
                
                <div style="
                  margin-top: 16px;
                  padding-top: 12px;
                  border-top: 1px solid #eee;
                  text-align: center;
                ">
                  <button onclick="window.openRestaurantDetails && window.openRestaurantDetails('${restaurantData.placeId || restaurantData.id}')" style="
                    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
                  " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(52, 152, 219, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(52, 152, 219, 0.3)'">
                    查看詳細資訊
                  </button>
                </div>
              </div>
            `
          });
          
          // 點擊標記顯示 InfoWindow
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
            setSelectedRestaurant(restaurantData);
            openModal('restaurant');
          });
          
          newMarkers.push(marker);
        });
        
        setMarkers(newMarkers);
        setRestaurants(searchResults);
        
        console.log(`已在地圖上顯示 ${newMarkers.length} 個搜尋結果標記`);
        
        // 如果有篩選後的結果，調整地圖視窗
        if (filteredResults.length > 0) {
          // 創建包含所有結果的範圍
          const resultBounds = new window.google.maps.LatLngBounds();
          filteredResults.forEach(result => {
            resultBounds.extend(result.geometry.location);
          });
          map.fitBounds(resultBounds);
        }
        
      } else {
        console.error('Geocoding 搜尋失敗:', status);
        
        // 如果沒有結果，嘗試更廣泛的搜尋
        if (status === 'ZERO_RESULTS') {
          console.log('嘗試更廣泛的搜尋');
          
          geocoder.geocode({
            address: `${query} 台灣`,
            componentRestrictions: { country: 'TW' }
          }, (broadResults, broadStatus) => {
            if (broadStatus === 'OK' && broadResults.length > 0) {
              console.log('廣泛搜尋成功，找到', broadResults.length, '個結果');
              
              // 處理廣泛搜尋的結果
              handleBroadSearchResults(broadResults.slice(0, 10), query);
            } else {
              alert('找不到符合條件的地點，請嘗試其他關鍵字');
            }
          });
        } else {
          alert(`搜尋失敗: ${status}`);
        }
      }
    });
  };

  // 處理廣泛搜尋結果
  const handleBroadSearchResults = (results, query) => {
    // 清除現有標記
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers = [];
    const searchResults = [];
    
    results.forEach((result, index) => {
      const location = result.geometry.location;
      
      let name = query;
      const addressParts = result.formatted_address.split(',');
      if (addressParts.length > 0) {
        const firstPart = addressParts[0].trim();
        if (firstPart.length > 0) {
          name = firstPart;
        }
      }
      
      const restaurantData = {
        id: result.place_id || `broad_${index}`,
        name: name,
        lat: location.lat(),
        lng: location.lng(),
        rating: 0,
        priceLevel: 0,
        isOpen: true,
        address: result.formatted_address,
        placeId: result.place_id,
        photos: [],
        types: result.types || ['restaurant']
      };
      
      searchResults.push(restaurantData);
      
      const marker = new window.google.maps.Marker({
        position: location,
        map: map,
        title: restaurantData.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#3498db" stroke="white" stroke-width="2"/>
              <path d="M12 10h2v12h-2zm4-2h2v14h-2zm4 4h2v10h-2z" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 300px;
            padding: 16px;
            margin: 0;
            border-radius: 16px;
            overflow: hidden;
          ">
            <h3 style="
              margin: 0 0 12px 0;
              font-size: 18px;
              font-weight: 600;
              color: #2c3e50;
              line-height: 1.3;
            ">${restaurantData.name}</h3>
            
            <div style="
              display: flex;
              align-items: center;
              margin: 12px 0;
              padding: 8px 12px;
              background-color: #f8f9fa;
              border-radius: 8px;
              border-left: 3px solid #e67e22;
            ">
              <span style="color: #e67e22; margin-right: 8px;">📍</span>
              <span style="color: #666; font-size: 14px; line-height: 1.4;">${restaurantData.address}</span>
            </div>
            
            <div style="
              display: inline-flex;
              align-items: center;
              padding: 6px 12px;
              background-color: #fef5e7;
              color: #e67e22;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 500;
              margin: 12px 0;
            ">
              🔍 擴大搜尋結果
            </div>
            
            <div style="
              margin-top: 16px;
              padding-top: 12px;
              border-top: 1px solid #eee;
              text-align: center;
            ">
              <button onclick="window.openRestaurantDetails && window.openRestaurantDetails('${restaurantData.placeId || restaurantData.id}')" style="
                background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(230, 126, 34, 0.3);
              " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(230, 126, 34, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(230, 126, 34, 0.3)'">
                查看詳細資訊
              </button>
            </div>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelectedRestaurant(restaurantData);
        openModal('restaurant');
      });
      
      newMarkers.push(marker);
    });
    
    setMarkers(newMarkers);
    setRestaurants(searchResults);
    
    // 調整地圖視窗到包含所有結果
    if (results.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      results.forEach(result => {
        bounds.extend(result.geometry.location);
      });
      map.fitBounds(bounds);
    }
  };



  return (
    <div className="map-container">
      {/* Google Maps */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* 搜尋欄 */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        filters={filters}
        onBudgetClick={() => openModal('budget')}
        onRatingClick={() => openModal('rating')}
        onToggleFilter={toggleFilter}
        onRandomClick={handleRandomRecommendation}
      />

      {/* 定位按鈕 */}
      <button 
        onClick={handleLocationClick}
        className="location-btn w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <i className="fas fa-location-arrow text-primary"></i>
      </button>

      {/* 模態框 */}
      {modals.budget && (
        <BudgetModal
          onClose={() => closeModal('budget')}
          onSelect={(budget) => {
            handleFilterChange('budget', budget);
            closeModal('budget');
          }}
          selectedBudget={filters.budget}
        />
      )}

      {modals.rating && (
        <RatingModal
          onClose={() => closeModal('rating')}
          onSelect={(rating) => {
            handleFilterChange('rating', rating);
            closeModal('rating');
          }}
          selectedRating={filters.rating}
        />
      )}

      {modals.restaurant && selectedRestaurant && (
        <RestaurantCard
          restaurant={selectedRestaurant}
          userLocation={userLocation}
          onClose={() => closeModal('restaurant')}
        />
      )}

      {modals.random && randomRestaurant && (
        <RandomModal
          restaurant={randomRestaurant}
          userLocation={userLocation}
          onClose={() => closeModal('random')}
          onTryAgain={handleRandomRecommendation}
        />
      )}

      {/* 背景點擊關閉模態框 */}
      {Object.values(modals).some(Boolean) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 modal-backdrop"
          onClick={closeAllModals}
        />
      )}
    </div>
  );
};

export default MapContainer;