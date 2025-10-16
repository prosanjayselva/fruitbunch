import React, {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';

const AdminHeader = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data from localStorage or an API
  const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Analytics';
    if (path === '/admin/orders') return 'Orders';
    if (path === '/admin/attendance') return 'Attendance';
    if (path === '/admin/subscriptions') return 'Subscriptions';
    if (path === '/admin/corporatequotes') return 'Function Quotes';
    if (path === '/admin/deliveryhistory') return 'Delivery History';
    return 'Dashboard';
  };

  const getPageDescription = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Overview of key metrics and performance';
    if (path === '/admin/orders') return 'Track and manage all delivery orders';
    if (path === '/admin/attendance') return 'Daily delivery performance tracking';
    if (path === '/admin/subscriptions') return 'Active subscriptions and customer management';
    if (path === '/admin/corporatequotes') return 'Manage function quotes and requests';
    if (path === '/admin/deliveryhistory') return 'Track and manage delivery history';
    return 'Manage your delivery operations efficiently';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 capitalize">
              {getPageTitle()}
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              {getPageDescription()}
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Welcome back, {user ? user.name : 'Admin'}
              </div>
              <div className="text-xs text-gray-500">
                Last updated: Just now
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
              <i className="fas fa-user"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;