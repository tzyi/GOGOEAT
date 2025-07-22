import React from 'react';

const RatingModal = ({ onClose, onSelect, selectedRating }) => {
  const ratingOptions = [
    { 
      value: 4.5, 
      label: '4.5 星以上',
      stars: [true, true, true, true, true]
    },
    { 
      value: 4.0, 
      label: '4.0 星以上',
      stars: [true, true, true, true, false]
    },
    { 
      value: 3.5, 
      label: '3.5 星以上',
      stars: [true, true, true, 'half', false]
    },
    { 
      value: 0, 
      label: '不限制',
      stars: null
    }
  ];

  const handleSelect = (value) => {
    onSelect(value === 0 ? null : value);
  };

  const renderStars = (stars) => {
    if (!stars) {
      return <span className="text-gray-400">任何評分</span>;
    }

    return (
      <div className="flex text-warning">
        {stars.map((star, index) => (
          <i 
            key={index}
            className={`fas ${
              star === true 
                ? 'fa-star' 
                : star === 'half' 
                  ? 'fa-star-half-alt' 
                  : 'far fa-star'
            }`}
          ></i>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div 
        className="w-full bg-white rounded-t-3xl p-6 animate-slide-up modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold mb-6 text-gray-800">最低評分要求</h3>
        
        <div className="space-y-4 mb-6">
          {ratingOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                selectedRating === option.value || (selectedRating === null && option.value === 0)
                  ? 'border-primary bg-primary bg-opacity-10'
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              {renderStars(option.stars)}
            </div>
          ))}
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-red-500 transition-colors"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;