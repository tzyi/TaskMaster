import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 如果用戶已登入，自動跳轉到收集箱
    if (user && !loading) {
      navigate('/inbox');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">TaskMaster 載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={() => navigate('/inbox')} />;
  }

  // 如果用戶已登入，顯示跳轉提示（實際會被 useEffect 跳轉）
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
          <i className="fas fa-check text-white text-sm"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          歡迎回到 TaskMaster！
        </h1>
        <p className="text-gray-600">
          正在跳轉到收集箱...
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
