import React, { useState } from 'react';
import TopNavigation from './TopNavigation';
import Sidebar from './Sidebar';

const PageLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation onToggleSidebar={handleToggleSidebar} />
      
      <div className="flex h-screen pt-16">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={handleCloseSidebar}
        />
        
        <main className="flex-1 overflow-y-auto lg:ml-0">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageLayout;