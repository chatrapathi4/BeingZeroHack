// -----------------------------------------
// Dashboard Layout
// Main app layout with sidebar and top bar
// -----------------------------------------
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { HiOutlineBars3 } from 'react-icons/hi2';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-surface-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors"
              id="sidebar-toggle"
            >
              <HiOutlineBars3 className="w-6 h-6" />
            </button>
            <h1 className="text-base font-semibold text-surface-800">Smart Artisan</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
