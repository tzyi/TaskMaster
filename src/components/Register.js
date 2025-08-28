import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Register = () => {
  const { signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 表單驗證
    if (!formData.fullName.trim()) {
      setError('請輸入姓名');
      return;
    }

    if (!formData.email.trim()) {
      setError('請輸入電子郵件');
      return;
    }

    if (formData.password.length < 6) {
      setError('密碼長度至少需要 6 個字元');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('密碼與確認密碼不一致');
      return;
    }

    if (!agreeTerms) {
      setError('請同意服務條款和隱私政策');
      return;
    }

    try {
      const { error } = await signUp(
        formData.email, 
        formData.password,
        {
          full_name: formData.fullName
        }
      );

      if (error) throw error;

      // 顯示成功訊息
      setShowSuccess(true);
      
      // 3秒後導航回登入頁面
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      const { error } = await signInWithGoogle();
      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/inbox');
      }, 1500);
    } catch (error) {
      console.error('Google sign up error:', error);
      setError(error.message);
    }
  };

  if (showSuccess) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
        <div className="login-card rounded-2xl p-8 max-w-md w-full shadow-xl relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">註冊成功！</h2>
            <p className="text-gray-600 mb-4">
              您的帳戶已成功建立。請檢查您的電子郵件以完成帳戶驗證。
            </p>
            <p className="text-gray-500 text-sm">
              3 秒後自動跳轉到登入頁面...
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              立即前往登入
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4 relative">
      {/* Floating Background Shapes */}
      <div className="floating-shapes"></div>
      
      {/* Main Register Container */}
      <div className="login-card rounded-2xl p-8 max-w-md w-full shadow-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fas fa-check text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold brand-text mb-2">TaskMaster</h1>
          <p className="text-gray-600">智能待辦事項管理平台</p>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-dark mb-2">立即註冊</h2>
          <p className="text-gray-600">建立您的 TaskMaster 帳戶</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-user mr-2 text-primary"></i>姓名
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-300"
              placeholder="請輸入您的姓名"
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-envelope mr-2 text-primary"></i>電子郵件
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-300"
              placeholder="請輸入您的電子郵件"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-lock mr-2 text-primary"></i>密碼
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-300 pr-12"
                placeholder="請輸入密碼（至少6位）"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-lock mr-2 text-primary"></i>確認密碼
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-300 pr-12"
                placeholder="請再次輸入密碼"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-600">
              我同意
              <button type="button" className="text-primary hover:text-opacity-80 transition-colors mx-1">
                服務條款
              </button>
              和
              <button type="button" className="text-primary hover:text-opacity-80 transition-colors mx-1">
                隱私政策
              </button>
            </label>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-primary to-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-500 hover:to-primary transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-user-plus mr-2"></i>
            {authLoading ? '註冊中...' : '立即註冊'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">或</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Sign-Up */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignUp}
            disabled={authLoading}
            className="google-btn w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            使用 Google 帳戶註冊
          </button>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            已經有帳戶？
            <Link 
              to="/" 
              className="text-primary hover:text-opacity-80 font-semibold transition-colors ml-1"
            >
              立即登入
            </Link>
          </p>
        </div>
      </div>

      {/* Loading Overlay */}
      {authLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">正在建立帳戶...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;