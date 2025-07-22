import React from 'react';

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onSearchSubmit,
  filters, 
  onBudgetClick, 
  onRatingClick, 
  onToggleFilter, 
  onRandomClick 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearchSubmit && onSearchSubmit(searchQuery);
    }
  };

  const handleSearchClick = () => {
    onSearchSubmit && onSearchSubmit(searchQuery);
  };
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="floating-card rounded-2xl p-2 sm:p-3">
        {/* Logo 和隨機按鈕 */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 search-container">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-utensils text-white text-xs sm:text-sm"></i>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 logo-text">
              {process.env.REACT_APP_NAME || 'GOGOEAT'}
            </h1>
          </div>
          
          {/* 今晚吃什麼按鈕 */}
          <button 
            onClick={onRandomClick}
            className="bg-warning text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full font-medium hover:bg-orange-500 transition-colors flex items-center space-x-1 sm:space-x-2 random-btn"
          >
            <i className="fas fa-dice text-sm"></i>
            <span className="hidden sm:inline">今晚吃什麼</span>
            <span className="sm:hidden">推薦</span>
          </button>
        </div>
        
        {/* 搜尋欄 */}
        <div className="relative mb-2">
          <input 
            type="text" 
            placeholder="搜尋餐廳、美食..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 sm:pl-12 pr-12 py-1.5 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent search-input"
          />
          <i className="fas fa-search absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
          <button 
            onClick={handleSearchClick}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white px-3 py-1 rounded-lg hover:bg-red-500 transition-colors text-sm"
          >
            搜尋
          </button>
        </div>
        
        {/* 篩選器 */}
        <div className="flex space-x-2 overflow-x-auto pb-2 filter-buttons">
          <button 
            onClick={onBudgetClick}
            className={`flex items-center space-x-1 sm:space-x-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full whitespace-nowrap transition-colors filter-btn ${
              filters.budget 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-primary hover:text-white'
            }`}
          >
            <i className="fas fa-dollar-sign text-xs sm:text-sm"></i>
            <span className="text-xs sm:text-sm">預算</span>
          </button>
          
          <button 
            onClick={onRatingClick}
            className={`flex items-center space-x-1 sm:space-x-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full whitespace-nowrap transition-colors filter-btn ${
              filters.rating 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-primary hover:text-white'
            }`}
          >
            <i className="fas fa-star text-xs sm:text-sm"></i>
            <span className="text-xs sm:text-sm">評分</span>
          </button>
          
          <button 
            onClick={() => onToggleFilter('isOpen')}
            className={`flex items-center space-x-1 sm:space-x-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full whitespace-nowrap transition-colors filter-btn ${
              filters.isOpen 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-primary hover:text-white'
            }`}
          >
            <i className="fas fa-clock text-xs sm:text-sm"></i>
            <span className="text-xs sm:text-sm">營業中</span>
          </button>
          
          <button 
            onClick={() => onToggleFilter('hasParking')}
            className={`flex items-center space-x-1 sm:space-x-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full whitespace-nowrap transition-colors filter-btn ${
              filters.hasParking 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-primary hover:text-white'
            }`}
          >
            <i className="fas fa-car text-xs sm:text-sm"></i>
            <span className="text-xs sm:text-sm">可停車</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;