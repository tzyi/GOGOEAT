import React from 'react';

const BudgetModal = ({ onClose, onSelect, selectedBudget }) => {
  const budgetOptions = [
    { value: 'under100', label: '$100 以下', icon: 'text-success' },
    { value: '100-300', label: '$100 - $300', icon: 'text-warning' },
    { value: '300-500', label: '$300 - $500', icon: 'text-orange-500' },
    { value: 'over500', label: '$500 以上', icon: 'text-red-500' }
  ];

  const handleSelect = (value) => {
    onSelect(value);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div 
        className="w-full bg-white rounded-t-3xl p-6 animate-slide-up modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold mb-6 text-gray-800">設定預算範圍</h3>
        
        <div className="space-y-4 mb-6">
          {budgetOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                selectedBudget === option.value
                  ? 'border-primary bg-primary bg-opacity-10'
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <i className={`fas fa-dollar-sign ${option.icon}`}></i>
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

export default BudgetModal;