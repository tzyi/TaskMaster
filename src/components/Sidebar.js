import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import LabelManager from './LabelManager';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [labels, setLabels] = useState([]);
  const [showLabelManager, setShowLabelManager] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: '/inbox',
      icon: 'fas fa-inbox',
      label: '收集箱',
      count: 5,
      countColor: 'bg-gray-300'
    },
    {
      path: '/today',
      icon: 'fas fa-calendar-day',
      label: '便條紙',
      count: 8,
      countColor: 'bg-orange-500'
    },
    {
      path: '/calendar',
      icon: 'fas fa-calendar-alt',
      label: '日曆視圖'
    },
    {
      path: '/matrix',
      icon: 'fas fa-th',
      label: '重要性矩陣'
    },
    {
      path: '/habits',
      icon: 'fas fa-heart',
      label: '習慣管理'
    }
  ];

  // 獲取使用者的標籤
  const fetchLabels = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching labels:', error);
      } else {
        setLabels(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [user]);

  // 處理標籤管理更新
  const handleLabelsChange = (updatedLabels) => {
    setLabels(updatedLabels);
  };

  useEffect(() => {
    if (user) {
      fetchLabels();
    }
  }, [user, fetchLabels]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-45 w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div className="p-6">
        {/* Main Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'text-orange-600 bg-orange-50 border border-orange-200'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <i className={`${item.icon} w-5 h-5 mr-3`}></i>
              <span className={isActive(item.path) ? 'font-medium' : ''}>
                {item.label}
              </span>
              {item.count && (
                <span className={`ml-auto ${item.countColor} text-white text-xs px-2 py-1 rounded-full`}>
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Projects Section */}
        {/* <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              項目
            </h3>
            <button className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
              <i className="fas fa-plus text-gray-600 text-xs"></i>
            </button>
          </div>
          <nav className="space-y-1">
            {projects.map((project) => (
              <Link
                key={project.path}
                to={project.path}
                className={`sidebar-item flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(project.path)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
              >
                <div className={`w-3 h-3 ${project.color} rounded-full mr-3`}></div>
                <span>{project.name}</span>
                <span className="ml-auto text-gray-400 text-sm">{project.count}</span>
              </Link>
            ))}
          </nav>
        </div> */}

        {/* Labels Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              標籤
            </h3>
            <button 
              onClick={() => setShowLabelManager(true)}
              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              title="管理標籤"
            >
              <i className="fas fa-plus text-gray-600 text-xs"></i>
            </button>
          </div>
          <div className="space-y-1">
            {labels.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                <i className="fas fa-tag text-lg mb-2"></i>
                <p>尚無標籤</p>
                <button
                  onClick={() => setShowLabelManager(true)}
                  className="text-orange-600 hover:text-orange-700 underline text-xs mt-1"
                >
                  立即建立
                </button>
              </div>
            ) : (
              labels.map((label) => (
                <div
                  key={label.id}
                  className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm text-gray-700">#{label.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 標籤管理 Modal */}
      <LabelManager
        isOpen={showLabelManager}
        onClose={() => setShowLabelManager(false)}
        onLabelsChange={handleLabelsChange}
        currentLabels={labels}
      />
    </aside>
    </>
  );
};

export default Sidebar;