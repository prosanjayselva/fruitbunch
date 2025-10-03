import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../pages/admin/AdminSidebar';
import AdminHeader from '../pages/admin/AdminHeader';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gradient-to-br from-emerald-50 to-green-50">
      {/* Sidebar */}
      <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header (fixed at top) */}
        <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-emerald-100">
          <div className="lg:hidden flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-emerald-50 text-emerald-700"
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="text-emerald-700 font-semibold">
              <i className="fas fa-leaf mr-2"></i>
              Admin Dashboard
            </div>
            <div className="w-6"></div>
          </div>
          <div className="hidden lg:block">
            <AdminHeader />
          </div>
        </div>

        {/* Scrollable Outlet */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;