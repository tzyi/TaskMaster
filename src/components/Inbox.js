import React from "react";
import { useAuth } from '../context/AuthContext';

const Inbox = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">收件匣</h1>
              <button 
                onClick={signOut}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                登出
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">帳戶資訊</h2>
              <p className="text-blue-800">
                <span className="font-medium">帳戶：</span> {user?.email || '未知'}
              </p>
            </div>

            <div className="text-center text-gray-500 py-12">
              <h3 className="text-xl font-medium mb-2">歡迎使用 TaskMaster</h3>
              <p>您的待辦事項管理中心</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
