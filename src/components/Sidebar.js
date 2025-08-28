import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

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
      label: '今天',
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
    },
    {
      path: '/pomodoro',
      icon: 'fas fa-clock',
      label: '番茄鐘'
    }
  ];

  const projects = [
    {
      name: '工作項目',
      color: 'bg-red-500',
      count: 12,
      path: '/project/work'
    },
    {
      name: '個人成長',
      color: 'bg-green-500',
      count: 8,
      path: '/project/personal'
    },
    {
      name: '健康生活',
      color: 'bg-blue-500',
      count: 5,
      path: '/project/health'
    }
  ];

  const labels = [
    { name: '#重要', color: 'bg-purple-100 text-purple-800' },
    { name: '#學習', color: 'bg-green-100 text-green-800' },
    { name: '#工作', color: 'bg-blue-100 text-blue-800' }
  ];

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
        <div className="mt-8">
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
        </div>

        {/* Labels Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              標籤
            </h3>
            <button className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
              <i className="fas fa-plus text-gray-600 text-xs"></i>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <span
                key={label.name}
                className={`px-3 py-1 ${label.color} text-sm rounded-full cursor-pointer hover:opacity-80 transition-opacity`}
              >
                {label.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;