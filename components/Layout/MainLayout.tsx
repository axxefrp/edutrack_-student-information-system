
import React, { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AppContext } from '../../App';
import ToastContainer from '../Shared/ToastContainer'; // Added

const MainLayout: React.FC = () => {
  const context = useContext(AppContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!context || !context.currentUser) {
    return null; // Or a loading indicator/redirect
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        userRole={context.currentUser.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header
          username={context.currentUser.username}
          onLogout={context.logout}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
          <Outlet /> {/* Nested routes will render here */}
        </main>
      </div>
      <ToastContainer /> {/* Added ToastContainer here */}
    </div>
  );
};

export default MainLayout;
