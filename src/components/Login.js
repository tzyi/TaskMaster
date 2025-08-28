import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = ({ onSuccess }) => {
  const { signIn, signInWithGoogle, resendConfirmation, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailNotConfirmed, setShowEmailNotConfirmed] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // 基本驗證
    if (!email.trim()) {
      setError('請輸入電子郵件');
      setIsSubmitting(false);
      return;
    }

    if (!password.trim()) {
      setError('請輸入密碼');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await signIn(email, password);

      if (error) {
        console.error('Login error details:', error);
        
        // 處理特定的 Supabase 錯誤訊息
        if (error.message.includes('email_not_confirmed') || 
            error.message.includes('Email not confirmed')) {
          setError('您的電子郵件尚未確認。請檢查您的郵箱並點擊確認連結。');
          setShowEmailNotConfirmed(true);
        } else if (error.message.includes('Invalid login credentials') || 
                   error.message.includes('invalid_grant') ||
                   error.message.includes('Invalid email or password') ||
                   error.status === 400) {
          setError('帳號或密碼錯誤，請檢查後重試');
        } else if (error.message.includes('User not found')) {
          setError('此帳戶不存在，請檢查電子郵件地址或立即註冊');
        } else {
          setError(`登入失敗：${error.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      // 登入成功
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/inbox');
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      setError('登入失敗，請稍後再試');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      const { error } = await signInWithGoogle();
      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/inbox');
      }, 1500);
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Google 登入失敗，請稍後再試');
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setError('請先輸入您的電子郵件地址');
      return;
    }

    try {
      setResendingEmail(true);
      setError('');
      
      const { error } = await resendConfirmation(email);
      
      if (error) {
        setError(`重新發送失敗：${error.message}`);
      } else {
        setError('');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setShowEmailNotConfirmed(false);
          setError('確認郵件已重新發送！請檢查您的郵箱。');
        }, 2000);
      }
    } catch (error) {
      console.error('Resend confirmation error:', error);
      setError('重新發送確認郵件失敗，請稍後再試');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4 relative">
      {/* Floating Background Shapes */}
      <div className="floating-shapes"></div>
      
      {/* Main Login Container */}
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
          <h2 className="text-2xl font-semibold text-dark mb-2">歡迎回來</h2>
          <p className="text-gray-600">登入您的帳戶以繼續使用 TaskMaster</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="mb-2">{error}</p>
            {showEmailNotConfirmed && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendingEmail}
                className="mt-2 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {resendingEmail ? '發送中...' : '重新發送確認郵件'}
              </button>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-envelope mr-2 text-primary"></i>電子郵件
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-300 pr-12"
                placeholder="請輸入您的密碼"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span className="ml-2 text-sm text-gray-600">記住我</span>
            </label>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" className="text-sm text-primary hover:text-opacity-80 transition-colors">
              忘記密碼？
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={authLoading || isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-500 hover:to-primary transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            {authLoading || isSubmitting ? '登入中...' : '登入'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">或</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Sign-In */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="google-btn w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            使用 Google 帳戶登入
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            還沒有帳戶？
            <Link 
              to="/register" 
              className="text-primary hover:text-opacity-80 font-semibold transition-colors ml-1"
            >
              立即註冊
            </Link>
          </p>
        </div>
      </div>

      {/* Loading Overlay */}
      {authLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">正在登入...</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-success text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50">
          <div className="flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            <span>登入成功！正在跳轉...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;