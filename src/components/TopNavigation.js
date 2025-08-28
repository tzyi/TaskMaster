import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TopNavigation = ({ onToggleSidebar }) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      // 登出後導航到根路徑（登入畫面）
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <i className="fas fa-bars text-gray-600"></i>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-check text-white text-sm"></i>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">TaskMaster</h1>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-xl mx-4 lg:mx-8">
          <div className="relative">
            <input 
              type="text" 
              placeholder="搜索任務、項目或標籤..." 
              className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
        
        {/* User Menu */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button className="md:block hidden p-2 rounded-lg hover:bg-gray-100">
            <i className="fas fa-search text-gray-600"></i>
          </button>
          <button className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 relative">
            <i className="fas fa-bell text-gray-600"></i>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <button className="hidden sm:block p-2 rounded-lg hover:bg-gray-100">
            <i className="fas fa-cog text-gray-600"></i>
          </button>
          <div className="relative">
            <button 
              onClick={toggleUserMenu}
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {user?.user_metadata?.picture || user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.picture || user.user_metadata.avatar_url} 
                  alt="用戶頭像" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </button>
            
            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-75 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    {user?.user_metadata?.picture || user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.picture || user.user_metadata.avatar_url} 
                        alt="用戶頭像" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-medium">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.user_metadata?.full_name || user?.user_metadata?.name || '未設定姓名'}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <div className="px-4 py-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">帳戶資訊</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">電子郵件：</span>
                        {user?.email}
                      </p>
                      <p>
                        <span className="font-medium">登入方式：</span>
                        {user?.app_metadata?.provider === 'google' ? 'Google' : '電子郵件'}
                      </p>
                      {user?.user_metadata?.full_name && (
                        <p>
                          <span className="font-medium">姓名：</span>
                          {user.user_metadata.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <i className="fas fa-user-circle text-gray-500"></i>
                      <span>個人設定</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <i className="fas fa-cog text-gray-500"></i>
                      <span>偏好設定</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <i className="fas fa-question-circle text-gray-500"></i>
                      <span>說明與支援</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button 
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium"
                    >
                      <i className="fas fa-sign-out-alt text-red-500"></i>
                      <span>登出</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay to close dropdown when clicking outside */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </header>
  );
};

export default TopNavigation;