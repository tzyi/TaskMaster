import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

const PREDEFINED_COLORS = [
  '#dc2626', // 紅色
  '#ea580c', // 橙色
  '#ca8a04', // 黃色
  '#059669', // 綠色
  '#0891b2', // 青色
  '#2563eb', // 藍色
  '#7c3aed', // 紫色
  '#be185d', // 粉色
  '#6b7280', // 灰色
];

const LabelManager = ({ isOpen, onClose, onLabelsChange, currentLabels = [] }) => {
  const { user } = useAuth();
  const [labels, setLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(PREDEFINED_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 獲取使用者的所有標籤
  const fetchLabels = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching labels:', error);
        setError('獲取標籤失敗');
      } else {
        setLabels(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('發生未預期的錯誤');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 新增標籤
  const addLabel = async () => {
    if (!user || !newLabelName.trim()) {
      setError('請輸入標籤名稱');
      return;
    }

    // 檢查標籤名稱是否重複
    const existingLabel = labels.find(label => 
      label.name.toLowerCase() === newLabelName.trim().toLowerCase()
    );
    
    if (existingLabel) {
      setError('標籤名稱已存在');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('labels')
        .insert([{
          user_id: user.id,
          name: newLabelName.trim(),
          color: newLabelColor
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating label:', error);
        setError('建立標籤失敗');
      } else {
        console.log('標籤建立成功:', data);
        setLabels(prev => [...prev, data]);
        setNewLabelName('');
        setNewLabelColor(PREDEFINED_COLORS[0]);
        
        // 通知父組件標籤已更新
        if (onLabelsChange) {
          onLabelsChange([...labels, data]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('發生未預期的錯誤');
    } finally {
      setLoading(false);
    }
  };

  // 刪除標籤
  const deleteLabel = async (labelId, labelName) => {
    const confirmed = window.confirm(
      `確定要刪除標籤「${labelName}」嗎？\n\n此操作將會從所有使用此標籤的任務中移除，且無法復原。`
    );
    
    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');

      const { error } = await supabase
        .from('labels')
        .delete()
        .eq('id', labelId);

      if (error) {
        console.error('Error deleting label:', error);
        setError('刪除標籤失敗');
      } else {
        console.log('標籤刪除成功');
        const updatedLabels = labels.filter(label => label.id !== labelId);
        setLabels(updatedLabels);
        
        // 通知父組件標籤已更新
        if (onLabelsChange) {
          onLabelsChange(updatedLabels);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('發生未預期的錯誤');
    } finally {
      setLoading(false);
    }
  };

  // 處理Enter鍵
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newLabelName.trim()) {
      addLabel();
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchLabels();
    }
  }, [isOpen, user, fetchLabels]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-6">
          {/* 標題 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">標籤管理</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* 錯誤信息 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 新增標籤 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新增標籤
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="標籤名稱..."
                value={newLabelName}
                onChange={(e) => {
                  setNewLabelName(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                maxLength={20}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              
              {/* 顏色選擇器 */}
              <div className="flex items-center space-x-1">
                {PREDEFINED_COLORS.map((color, index) => (
                  <button
                    key={color}
                    onClick={() => setNewLabelColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      newLabelColor === color 
                        ? 'border-gray-400 scale-110' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`顏色 ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={addLabel}
                disabled={!newLabelName.trim() || loading}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '新增中...' : '新增'}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              標籤名稱最多20個字元
            </div>
          </div>

          {/* 現有標籤列表 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              現有標籤 ({labels.length})
            </label>
            
            {loading && labels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                載入標籤中...
              </div>
            ) : labels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-tag text-4xl mb-2"></i>
                <p>尚無任何標籤</p>
                <p className="text-sm">建立第一個標籤來開始分類您的任務</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="font-medium text-gray-900">
                        #{label.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(label.created_at).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => deleteLabel(label.id, label.name)}
                      disabled={loading}
                      className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="刪除標籤"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部按鈕 */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelManager;
