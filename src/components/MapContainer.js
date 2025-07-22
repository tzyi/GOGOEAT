import React, { useState, useEffect, useRef } from 'react';
import SearchBar from './SearchBar';
import RestaurantCard from './RestaurantCard';
import BudgetModal from './BudgetModal';
import RatingModal from './RatingModal';
import RandomModal from './RandomModal';
import { calculateDistance } from '../utils/mapUtils';

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

  // 等待Google Maps API載入
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
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
        
        // 初始化 Places Service
        const service = new window.google.maps.places.PlacesService(mapInstance);
        setPlacesService(service);
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

  // 搜尋提交處理
  const handleSearchSubmit = async (query) => {
    console.log('搜尋開始:', query);
    
    if (!query.trim()) {
      alert('請輸入搜尋關鍵字');
      return;
    }
    
    if (!userLocation) {
      console.error('User location not available');
      alert('無法取得您的位置，請確認定位權限');
      return;
    }

    console.log('準備搜尋:', { query, userLocation });
    
    // 先嘗試使用 Geocoding API 進行地址搜尋
    try {
      await searchWithGeocoding(query);
    } catch (error) {
      console.error('Geocoding 搜尋失敗:', error);
      
      // 如果 Geocoding 失敗且 Places Service 可用，則嘗試 Places API
      if (placesService) {
        console.log('嘗試使用 Places API');
        searchWithPlaces(query);
      } else {
        alert('搜尋服務暫時無法使用，請稍後再試');
      }
    }
  };

  // 使用 Geocoding API 搜尋
  const searchWithGeocoding = (query) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      const searchAddress = `${query} restaurant near ${userLocation.lat},${userLocation.lng}`;
      
      console.log('Geocoding 搜尋:', searchAddress);
      
      geocoder.geocode({
        address: searchAddress,
        componentRestrictions: { country: 'TW' }
      }, (results, status) => {
        console.log('Geocoding 結果:', { results, status });
        
        if (status === 'OK' && results.length > 0) {
          const searchResults = results.slice(0, 10).map((result, index) => ({
            id: result.place_id || index,
            name: result.formatted_address.split(',')[0] || query,
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            rating: 0,
            priceLevel: 0,
            isOpen: true,
            address: result.formatted_address,
            placeId: result.place_id,
            photos: [],
            types: result.types || ['restaurant']
          }));
          
          console.log('Geocoding 搜尋成功，找到', searchResults.length, '個結果');
          setRestaurants(searchResults);
          addRestaurantMarkers(searchResults);
          
          if (searchResults.length > 0) {
            const firstResult = searchResults[0];
            map.setCenter({ lat: firstResult.lat, lng: firstResult.lng });
            map.setZoom(16);
          }
          
          resolve(searchResults);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  };

  // 使用 Places API 搜尋（備用方法）
  const searchWithPlaces = (query) => {
    const request = {
      location: userLocation,
      radius: 5000,
      keyword: query,
      type: ['restaurant']
    };

    console.log('Places API 搜尋請求:', request);

    placesService.nearbySearch(request, (results, status) => {
      console.log('Places API 搜尋結果:', { results, status });
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        console.log('Places API 搜尋成功，找到', results.length, '個結果');
        
        const searchResults = results.map((place, index) => ({
          id: place.place_id || index,
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          rating: place.rating || 0,
          priceLevel: place.price_level || 0,
          isOpen: place.opening_hours?.open_now ?? true,
          address: place.formatted_address || place.vicinity,
          placeId: place.place_id,
          photos: place.photos || [],
          types: place.types || []
        }));
        
        setRestaurants(searchResults);
        addRestaurantMarkers(searchResults);
        
        if (searchResults.length > 0) {
          const firstResult = searchResults[0];
          map.setCenter({ lat: firstResult.lat, lng: firstResult.lng });
          map.setZoom(16);
        }
      } else {
        console.error('Places API 搜尋失敗:', status);
        alert('找不到符合條件的餐廳，請嘗試其他關鍵字');
      }
    });
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