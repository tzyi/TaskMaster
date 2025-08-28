import React from 'react';
import PageLayout from '../components/PageLayout';

const Matrix = () => {
  return (
    <PageLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">重要性矩陣</h1>
        <p className="text-gray-600 mb-6">使用艾森豪威爾矩陣管理任務優先級</p>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <i className="fas fa-th text-6xl text-purple-500 mb-4"></i>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">優先級矩陣</h2>
            <p className="text-gray-600">
              這裡將顯示重要性與緊急性的四象限任務分類
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Matrix;