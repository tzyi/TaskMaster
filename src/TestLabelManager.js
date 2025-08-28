import React, { useState } from 'react';
import LabelManager from './components/LabelManager';

// 測試標籤管理器功能的簡單測試組件
const TestLabelManager = () => {
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [labels, setLabels] = useState([]);

  const handleLabelsChange = (updatedLabels) => {
    setLabels(updatedLabels);
    console.log('標籤已更新:', updatedLabels);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">標籤管理測試</h1>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">當前標籤數量: {labels.length}</p>
          <div className="flex flex-wrap gap-2">
            {labels.map(label => (
              <span 
                key={label.id}
                className="px-3 py-1 text-sm rounded-full"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color
                }}
              >
                #{label.name}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowLabelManager(true)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          打開標籤管理器
        </button>

        <LabelManager
          isOpen={showLabelManager}
          onClose={() => setShowLabelManager(false)}
          onLabelsChange={handleLabelsChange}
          currentLabels={labels}
        />
      </div>
    </div>
  );
};

export default TestLabelManager;
