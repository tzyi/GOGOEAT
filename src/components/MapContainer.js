import React, { useState, useEffect, useRef } from 'react';
import SearchBar from './SearchBar';
import RestaurantCard from './RestaurantCard';
import BudgetModal from './BudgetModal';
import RatingModal from './RatingModal';
import RandomModal from './RandomModal';
import { restaurantData } from '../data/restaurants';
import { calculateDistance } from '../utils/mapUtils';

const MapContainer = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [randomRestaurant, setRandomRestaurant] = useState(null);
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

  // 初始化地圖
  useEffect(() => {
    if (mapRef.current && !map) {
      const defaultLocation = {
        lat: parseFloat(process.env.REACT_APP_DEFAULT_LAT) || 25.0330,
        lng: parseFloat(process.env.REACT_APP_DEFAULT_LNG) || 121.5654
      };

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: parseInt(process.env.REACT_APP_DEFAULT_ZOOM) || 15,
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
      getCurrentLocation(mapInstance, defaultLocation);
    }
  }, [map]);

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

  // 添加餐廳標記
  useEffect(() => {
    if (map && userLocation) {
      addRestaurantMarkers();
    }
  }, [map, userLocation, filters, searchQuery]);

  const addRestaurantMarkers = () => {
    // 清除現有標記
    markers.forEach(marker => marker.setMap(null));
    
    const filteredRestaurants = getFilteredRestaurants();
    const newMarkers = [];

    filteredRestaurants.forEach(restaurant => {
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
        setSelectedRestaurant(restaurant);
        openModal('restaurant');
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  };

  // 篩選餐廳
  const getFilteredRestaurants = () => {
    return restaurantData.filter(restaurant => {
      // 搜尋篩選
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!restaurant.name.toLowerCase().includes(query) && 
            !restaurant.category.toLowerCase().includes(query)) {
          return false;
        }
      }

      // 預算篩選
      if (filters.budget) {
        const budgetRanges = {
          'under100': [0, 100],
          '100-300': [100, 300],
          '300-500': [300, 500],
          'over500': [500, 9999]
        };
        
        const range = budgetRanges[filters.budget];
        const restaurantPrice = parseInt(restaurant.priceRange.split('-')[1].replace('$', ''));
        
        if (restaurantPrice < range[0] || restaurantPrice > range[1]) {
          return false;
        }
      }

      // 評分篩選
      if (filters.rating && restaurant.rating < filters.rating) {
        return false;
      }

      // 營業狀態篩選
      if (filters.isOpen && !restaurant.isOpen) {
        return false;
      }

      // 停車場篩選
      if (filters.hasParking && !restaurant.hasParking) {
        return false;
      }

      return true;
    });
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
    
    setRandomRestaurant(restaurant);
    openModal('random');

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
  const handleSearchSubmit = (query) => {
    if (!query.trim()) return;
    
    const filteredRestaurants = restaurantData.filter(restaurant => {
      const searchTerm = query.toLowerCase();
      return restaurant.name.toLowerCase().includes(searchTerm) || 
             restaurant.category.toLowerCase().includes(searchTerm) ||
             restaurant.description.toLowerCase().includes(searchTerm);
    });

    if (filteredRestaurants.length > 0) {
      // 將地圖中心移動到第一個匹配的餐廳
      const firstResult = filteredRestaurants[0];
      map.setCenter({ lat: firstResult.lat, lng: firstResult.lng });
      map.setZoom(16);
      
      // 如果只有一個結果，直接顯示餐廳詳情
      if (filteredRestaurants.length === 1) {
        setSelectedRestaurant(firstResult);
        openModal('restaurant');
      }
    } else {
      alert('找不到符合條件的餐廳，請嘗試其他關鍵字');
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