import React from 'react';
import PageLayout from '../components/PageLayout';

const Today = () => {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">便條紙</h1>
        <p className="text-gray-600 mb-6">裝下你所有的靈感</p>
        
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="text-center py-8 sm:py-12">
            <i className="fas fa-calendar-day text-4xl sm:text-6xl text-orange-500 mb-4"></i>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">便條紙</h2>
            <p className="text-gray-600">
              這裡將顯示您所有的靈感
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Today;