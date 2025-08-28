import React from 'react';
import PageLayout from '../components/PageLayout';

const Today = () => {
  return (
    <PageLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">今天</h1>
        <p className="text-gray-600 mb-6">管理您今天的所有任務</p>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <i className="fas fa-calendar-day text-6xl text-orange-500 mb-4"></i>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">今日任務</h2>
            <p className="text-gray-600">
              這裡將顯示您今天需要完成的任務列表
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Today;