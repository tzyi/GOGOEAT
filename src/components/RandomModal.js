import React from 'react';
import { calculateDistance } from '../utils/mapUtils';

const RandomModal = ({ restaurant, userLocation, onClose, onTryAgain }) => {
  const distance = userLocation 
    ? calculateDistance(userLocation, { lat: restaurant.lat, lng: restaurant.lng })
    : 0;

  const handleDecision = () => {
    onClose();
    // 可以在這裡添加更多邏輯，比如保存到收藏或直接導航
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div 
        className="w-full bg-white rounded-t-3xl animate-slide-up modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center relative">
          {/* 關閉按鈕 */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-gray-500"></i>
          </button>
          
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          
          <div className="mb-6">
            <div className="w-20 h-20 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-dice text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">今晚就吃這家！</h3>
            <p className="text-gray-600">為你隨機推薦附近的美食</p>
          </div>
          
          {/* 推薦餐廳 */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="w-24 h-24 rounded-xl mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <div className="text-white text-2xl font-bold">
                {restaurant.name.charAt(0)}
              </div>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h4>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <i className="fas fa-star text-warning mr-1"></i>
                <span>{restaurant.rating}</span>
              </div>
              <span>•</span>
              <span>{restaurant.priceRange}</span>
              {userLocation && (
                <>
                  <span>•</span>
                  <span>{distance.toFixed(1)}km</span>
                </>
              )}
            </div>
            <div className="flex justify-center space-x-2">
              {restaurant.isOpen && (
                <span className="px-3 py-1 bg-success text-white text-xs rounded-full">營業中</span>
              )}
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {restaurant.category}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={onTryAgain}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              再選一次
            </button>
            <button 
              onClick={handleDecision}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-red-500 transition-colors"
            >
              就決定是你了！
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomModal;