import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import PageLayout from './PageLayout';

const Inbox = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <PageLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">收件匣</h1>
        <p className="text-gray-600 mb-6">管理您的所有待辦事項</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">帳戶資訊</h2>
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-blue-600">載入中...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {profile?.avatar_url && (
                <div className="flex items-center mb-3">
                  <img 
                    src={profile.avatar_url} 
                    alt="頭像" 
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-blue-800 font-medium">
                      {profile.full_name || '未設定姓名'}
                    </p>
                  </div>
                </div>
              )}
              <p className="text-blue-800">
                <span className="font-medium">電子郵件：</span> {user?.email || profile?.email || '未知'}
              </p>
              <p className="text-blue-800">
                <span className="font-medium">姓名：</span> {profile?.full_name || '未設定'}
              </p>
              <p className="text-blue-800">
                <span className="font-medium">登入方式：</span> {profile?.provider === 'google' ? 'Google' : '電子郵件'}
              </p>
              {profile?.created_at && (
                <p className="text-blue-600 text-sm">
                  <span className="font-medium">註冊時間：</span> {new Date(profile.created_at).toLocaleString('zh-TW')}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <i className="fas fa-inbox text-6xl text-orange-500 mb-4"></i>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">歡迎使用 TaskMaster</h3>
            <p className="text-gray-600">您的待辦事項管理中心</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Inbox;
