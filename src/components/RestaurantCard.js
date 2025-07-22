import React from 'react';
import { calculateDistance } from '../utils/mapUtils';

const RestaurantCard = ({ restaurant, userLocation, onClose }) => {
  const distance = userLocation 
    ? calculateDistance(userLocation, { lat: restaurant.lat, lng: restaurant.lng })
    : 0;

  const handleNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div 
        className="w-full bg-white rounded-t-3xl animate-slide-up modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          {/* 餐廳圖片 */}
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-48 object-cover rounded-xl mb-4"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x200/FF6B6B/FFFFFF?text=${encodeURIComponent(restaurant.name)}`;
            }}
          />
          
          {/* 餐廳資訊 */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{restaurant.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <i className="fas fa-star text-warning mr-1"></i>
                <span>{restaurant.rating}</span>
                <span className="ml-1">({restaurant.reviews} 評論)</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-dollar-sign text-success mr-1"></i>
                <span>{restaurant.priceRange}</span>
              </div>
              {userLocation && (
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-primary mr-1"></i>
                  <span>{distance.toFixed(1)}km</span>
                </div>
              )}
            </div>
            
            {/* 標籤 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.isOpen && (
                <span className="px-3 py-1 bg-success text-white text-xs rounded-full">營業中</span>
              )}
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {restaurant.category}
              </span>
              {restaurant.hasParking && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">可停車</span>
              )}
            </div>
            
            {/* 地址和電話 */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt w-4 mr-2"></i>
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-phone w-4 mr-2"></i>
                <span>{restaurant.phone}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-clock w-4 mr-2"></i>
                <span>{restaurant.hours}</span>
              </div>
            </div>
          </div>
          
          {/* 操作按鈕 */}
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              關閉
            </button>
            <button 
              onClick={handleNavigation}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-red-500 transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fas fa-directions"></i>
              <span>導航</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;