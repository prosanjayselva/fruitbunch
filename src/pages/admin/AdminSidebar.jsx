import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line', path: '/admin' },
    { id: 'subscriptions', label: 'Subscriptions', icon: 'fa-chart-pie', path: '/admin/subscriptions' },
    { id: 'orders', label: 'Orders', icon: 'fa-box', path: '/admin/orders' },
    { id: 'attendance', label: 'Attendance', icon: 'fa-users', path: '/admin/attendance' },
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    return tabs.find(tab => currentPath === tab.path)?.id || 'subscriptions';
  };

  const handleTabClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className={`fixed lg:static inset-y-0 left-0 z-40 w-64 h-[100vh] bg-white shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="py-6 p-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
          <h1 className="text-xl font-bold">
            Fruit Bunch Admin
          </h1>
          <p className="text-emerald-100 text-sm mt-1">
            Sustainable Delivery Management
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                getActiveTab() === tab.id
                  ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <i className={`fas ${tab.icon} text-lg mr-3`}></i>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="text-center text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;