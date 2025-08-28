import React from 'react';
import PageLayout from '../components/PageLayout';

const Habits = () => {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">習慣管理</h1>
        <p className="text-gray-600 mb-6">建立和追蹤您的日常習慣</p>
        
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="text-center py-8 sm:py-12">
            <i className="fas fa-heart text-4xl sm:text-6xl text-red-500 mb-4"></i>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">習慣追蹤</h2>
            <p className="text-gray-600">
              這裡將顯示您的習慣追蹤和進度管理
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Habits;