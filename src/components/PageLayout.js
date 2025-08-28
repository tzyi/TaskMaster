import React from 'react';
import TopNavigation from './TopNavigation';
import Sidebar from './Sidebar';

const PageLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <div className="flex h-screen pt-20">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageLayout;