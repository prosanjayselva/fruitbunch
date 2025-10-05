import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const AnalyticsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [timeRange, setTimeRange] = useState('all'); // affects all metrics
  const [revenueRange, setRevenueRange] = useState('all'); // revenue-specific filter

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

  // --- Helper for filtering ---
  const filterByTimeRange = (orders, range) => {
    const now = new Date();
    if (range === 'week') {
      const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
      return orders.filter(order => new Date(order.createdAt) >= weekAgo);
    }
    if (range === 'month') {
      const monthAgo = new Date(); monthAgo.setMonth(now.getMonth() - 1);
      return orders.filter(order => new Date(order.createdAt) >= monthAgo);
    }
    return orders;
  };

  // Apply filters
  const filteredOrders = filterByTimeRange(orders, timeRange);
  const filteredRevenueOrders = filterByTimeRange(orders, revenueRange);

  // --- Metrics ---
  const totalRevenue = filteredRevenueOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const activeSubscriptions = subscriptions.filter(sub => sub.orders.length > 0).length;
  const deliverySuccessRate = filteredOrders.length > 0 
    ? Math.round((filteredOrders.filter(o => o.deliveryStatus === 'delivered').length / filteredOrders.length) * 100)
    : 0;

  const filteredRevenueOrdersCount = filteredRevenueOrders.length;
  const averageOrderValue = filteredRevenueOrdersCount > 0 
    ? Math.round(totalRevenue / filteredRevenueOrdersCount) 
    : 0;

  const repeatCustomers = subscriptions.filter(sub => sub.orders.length > 1).length;
  const pendingOrders = filteredOrders.filter(o => o.deliveryStatus === 'pending').length;
  const cancelledOrders = filteredOrders.filter(o => o.deliveryStatus === 'cancelled').length;

  // Top products
  const productSalesMap = {};
  filteredRevenueOrders.forEach(order => {
    order.items?.forEach(item => {
      if (!productSalesMap[item.name]) productSalesMap[item.name] = 0;
      productSalesMap[item.name] += item.quantity || 1;
    });
  });
  const topProducts = Object.entries(productSalesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

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
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Analytics</h2>
          <p className="text-emerald-700 text-sm">Performance metrics and insights</p>
        </div>
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-emerald-200 rounded-xl px-4 py-2 bg-white text-sm"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="week">Last Week</option>
          </select>
          <select
            value={revenueRange}
            onChange={(e) => setRevenueRange(e.target.value)}
            className="border border-emerald-200 rounded-xl px-4 py-2 bg-white text-sm"
          >
            <option value="all">All Revenue</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard title="Total Users" value={subscriptions.length} subtitle="Registered customers" fromColor="from-emerald-500" toColor="to-green-500" />
        <MetricCard title="Active Subscriptions" value={activeSubscriptions} subtitle="Current active plans" fromColor="from-green-500" toColor="to-emerald-600" />
        <MetricCard title="Revenue" value={`₹${totalRevenue}`} subtitle={revenueRange === 'all' ? 'Lifetime revenue' : revenueRange === 'month' ? 'Monthly revenue' : 'Weekly revenue'} fromColor="from-emerald-600" toColor="to-green-700" />
        <MetricCard title="Success Rate" value={`${deliverySuccessRate}%`} subtitle="Delivery success rate" fromColor="from-blue-500" toColor="to-indigo-600" />

        <MetricCard title="Average Order Value" value={`₹${averageOrderValue}`} subtitle="Revenue per order" fromColor="from-purple-500" toColor="to-purple-700" />
        <MetricCard title="Repeat Customers" value={repeatCustomers} subtitle="Customers with multiple orders" fromColor="from-pink-500" toColor="to-pink-700" />
        {/* <MetricCard title="Pending Orders" value={pendingOrders} subtitle="Orders awaiting delivery" fromColor="from-yellow-500" toColor="to-yellow-600" />
        <MetricCard title="Cancelled Orders" value={cancelledOrders} subtitle="Orders not completed" fromColor="from-gray-500" toColor="to-gray-600" /> */}

        {topProducts.map(([name, count], idx) => (
          <MetricCard key={idx} title={`Top Product`} value={name} subtitle={`${count} sold`} fromColor="from-emerald-400" toColor="to-green-400" />
        ))}
      </div>
    </div>
  );
};

// --- Metric Card Component ---
const MetricCard = ({ title, value, subtitle, fromColor, toColor }) => (
  <div className={`bg-gradient-to-br ${fromColor} ${toColor} p-4 lg:p-6 rounded-2xl text-white shadow-lg`}>
    <h3 className="text-lg font-semibold">{title}</h3>
    <div className="text-2xl lg:text-3xl font-bold mt-2">{value}</div>
    <p className="text-white/70 text-xs lg:text-sm mt-2">{subtitle}</p>
  </div>
);

export default AnalyticsPage;