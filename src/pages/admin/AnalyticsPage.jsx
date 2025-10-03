import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const AnalyticsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, month, week

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch orders
      const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      setOrders(ordersData);

      // Fetch users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const subscriptionsWithOrders = usersData.map(user => {
        const userOrders = ordersData.filter(order => order.userId === user.id);
        return {
          user,
          orders: userOrders,
          totalOrders: userOrders.length,
          totalSpent: userOrders.reduce((sum, order) => sum + (order.amount || 0), 0)
        };
      });

      setSubscriptions(subscriptionsWithOrders);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByTimeRange = (orders) => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return orders.filter(order => new Date(order.createdAt) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return orders.filter(order => new Date(order.createdAt) >= monthAgo);
      default:
        return orders;
    }
  };

  const filteredOrders = filterOrdersByTimeRange(orders);

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const activeSubscriptions = subscriptions.filter(sub => sub.orders.length > 0).length;
  const deliverySuccessRate = filteredOrders.length > 0 
    ? Math.round((filteredOrders.filter(o => o.deliveryStatus === 'delivered').length / filteredOrders.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-3 text-emerald-700 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Business Analytics</h2>
            <p className="text-emerald-700 text-sm">
              Performance metrics and insights
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-emerald-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="week">Last Week</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-4 lg:p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-emerald-100">
                Total Users
              </h3>
              <div className="text-2xl lg:text-3xl font-bold mt-2">{subscriptions.length}</div>
            </div>
            <div className="text-2xl lg:text-3xl">
              <i className="fas fa-user-friends"></i>
            </div>
          </div>
          <div className="text-emerald-200 text-xs lg:text-sm mt-4">
            Registered customers
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 lg:p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-emerald-100">
                Active Subscriptions
              </h3>
              <div className="text-2xl lg:text-3xl font-bold mt-2">{activeSubscriptions}</div>
            </div>
            <div className="text-2xl lg:text-3xl">
              <i className="fas fa-boxes"></i>
            </div>
          </div>
          <div className="text-emerald-200 text-xs lg:text-sm mt-4">
            Current active plans
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-4 lg:p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-emerald-100">
                Total Revenue
              </h3>
              <div className="text-2xl lg:text-3xl font-bold mt-2">
                ₹{totalRevenue}
              </div>
            </div>
            <div className="text-2xl lg:text-3xl">
              <i className="fas fa-money-bill-wave"></i>
            </div>
          </div>
          <div className="text-emerald-200 text-xs lg:text-sm mt-4">
            {timeRange === 'all' ? 'Lifetime' : timeRange === 'month' ? 'This month' : 'This week'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 lg:p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-100">
                Success Rate
              </h3>
              <div className="text-2xl lg:text-3xl font-bold mt-2">
                {deliverySuccessRate}%
              </div>
            </div>
            <div className="text-2xl lg:text-3xl">
              <i className="fas fa-chart-line"></i>
            </div>
          </div>
          <div className="text-blue-200 text-xs lg:text-sm mt-4">
            Delivery success rate
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            {['delivered', 'pending', 'not_delivered', 'cancelled', 'leave'].map(status => {
              const count = filteredOrders.filter(order => order.deliveryStatus === status).length;
              const percentage = filteredOrders.length > 0 ? (count / filteredOrders.length) * 100 : 0;
              const statusColors = {
                delivered: 'bg-emerald-500',
                pending: 'bg-amber-500',
                not_delivered: 'bg-red-500',
                cancelled: 'bg-gray-500',
                leave: 'bg-blue-500'
              };

              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${statusColors[status]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredOrders.slice(0, 10).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Order #{order.id.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600">₹{order.amount}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.deliveryStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    order.deliveryStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.deliveryStatus || 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;