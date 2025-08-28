import React from 'react';
import PageLayout from '../components/PageLayout';

const Calendar = () => {
  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">日曆視圖</h1>
        <p className="text-gray-600 mb-6">以日曆方式查看您的任務和計劃</p>
        
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="text-center py-8 sm:py-12">
            <i className="fas fa-calendar-alt text-4xl sm:text-6xl text-blue-500 mb-4"></i>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">日曆檢視</h2>
            <p className="text-gray-600">
              這裡將顯示您的任務日曆視圖
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Calendar;