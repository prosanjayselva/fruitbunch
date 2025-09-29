import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom green marker icon
const markerIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='%2300C853'%3E%3Cpath d='M16 2C10.48 2 6 6.48 6 12c0 8 10 18 10 18s10-10 10-18c0-5.52-4.48-10-10-10zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'/%3E%3C/svg%3E",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAttendanceOrder, setSelectedAttendanceOrder] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendanceData();
    }
  }, [activeTab, selectedDate, orders]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch orders
      const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          shippingAddress: {
            address: data.shipping?.address || '',
            city: data.shipping?.city || '',
            state: data.shipping?.state || '',
            pincode: data.shipping?.pincode || '',
            country: data.shipping?.country || '',
            location: data.shipping?.location || null
          }
        };
      });
      setOrders(ordersData);

      // Fetch users and their subscriptions
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const subscriptionsWithOrders = usersData.map(user => {
        const userOrders = ordersData.filter(order => order.userId === user.id);
        const activeSubscription = userOrders.length > 0 ? {
          ...userOrders[0],
          daysLeft: calculateDaysLeft(userOrders[0].createdAt),
          status: calculateSubscriptionStatus(userOrders[0].createdAt)
        } : null;

        return {
          user,
          orders: userOrders,
          activeSubscription,
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

  const fetchAttendanceData = async () => {
    try {
      const selected = new Date(selectedDate);

      const selectedOrders = orders.map(order => {
        const extraDays = order.extraDays || 0;
        const daysLeft = calculateDaysLeft(order.createdAt, extraDays);
        const subscriptionStatus = calculateSubscriptionStatus(order.createdAt, extraDays);

        return {
          ...order,
          daysLeft,
          subscriptionStatus,
          customerName: `${order.shipping?.firstName || ''} ${order.shipping?.lastName || ''}`.trim() || 'Unknown Customer'
        };
      }).filter(order => {
        // Filter orders that are valid for the selected date
        const startDate = new Date(order.createdAt);
        const baseValidityDays = 26;
        const totalValidityDays = baseValidityDays + (order.extraDays || 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + totalValidityDays - 1);

        return selected >= startDate && selected <= endDate;
      });

      setAttendanceData({
        date: selectedDate,
        totalOrders: selectedOrders.length,
        delivered: selectedOrders.filter(o => o.deliveryStatus === "delivered").length,
        notDelivered: selectedOrders.filter(o =>
          !o.deliveryStatus ||
          o.deliveryStatus === "pending" ||
          o.deliveryStatus === "not_delivered" ||
          o.deliveryStatus === "cancelled"
        ).length,
        orders: selectedOrders
      });
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const calculateDaysLeft = (startDate, extraDays = 0) => {
    if (!startDate) return 0;

    const start = new Date(startDate);
    const baseValidityDays = 26; // Base subscription period
    const totalValidityDays = baseValidityDays + (extraDays || 0);

    const expiryDate = new Date(start);
    expiryDate.setDate(start.getDate() + totalValidityDays);

    const now = new Date();
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    return Math.max(0, daysLeft);
  };

  const calculateSubscriptionStatus = (startDate, extraDays = 0) => {
    const daysLeft = calculateDaysLeft(startDate, extraDays);
    if (daysLeft === 0) return 'expired';
    if (daysLeft <= 7) return 'expiring_soon';
    return 'active';
  };

  const updateDeliveryStatus = async (orderId, status) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        deliveryStatus: status,
        updatedAt: Timestamp.now()
      });
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, deliveryStatus: status } : order));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, deliveryStatus: status }));
      if (selectedAttendanceOrder?.id === orderId) setSelectedAttendanceOrder(prev => ({ ...prev, deliveryStatus: status }));

      // Refresh attendance data
      fetchAttendanceData();

      alert(`Delivery status updated to ${status}`);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      alert('Error updating delivery status');
    }
  };

  // Cancel only for one user - Add one day grace period
  const handleCancelDay = async (orderId) => {
    try {
      // Find the order
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        alert("Order not found");
        return;
      }

      const orderRef = doc(db, "orders", orderId);
      const currentExtraDays = order.extraDays || 0;

      // Update the order with extraDays and mark as cancelled
      await updateDoc(orderRef, {
        extraDays: currentExtraDays + 1,
        deliveryStatus: "cancelled",
        updatedAt: Timestamp.now(),
        events: arrayUnion({
          type: "cancel",
          date: new Date().toISOString(),
        }),
      });

      // Refresh data
      await fetchData();
      if (activeTab === 'attendance') {
        await fetchAttendanceData();
      }

      alert("Cancelled today for this user. Timeline extended by 1 day.");
    } catch (error) {
      console.error("Error cancelling day:", error);
      alert("Error cancelling delivery");
    }
  };

  // Leave for all users - Add one day grace period for all active orders
  const handleGlobalLeave = async () => {
    try {
      // Get all orders that are active for today
      const todayOrders = attendanceData.orders || [];

      const updatePromises = todayOrders.map(async (order) => {
        const orderRef = doc(db, "orders", order.id);
        const currentExtraDays = order.extraDays || 0;

        return updateDoc(orderRef, {
          extraDays: currentExtraDays + 1,
          deliveryStatus: "leave",
          updatedAt: Timestamp.now(),
          events: arrayUnion({
            type: "global_leave",
            date: new Date().toISOString(),
          }),
        });
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      // Refresh data
      await fetchData();
      if (activeTab === 'attendance') {
        await fetchAttendanceData();
      }

      alert("Marked today as leave. Timeline extended by 1 day for all users.");
    } catch (error) {
      console.error("Error marking leave:", error);
      alert("Error marking leave for all users");
    }
  };

  const openAttendanceModal = (order) => {
    setSelectedAttendanceOrder(order);
    setShowAttendanceModal(true);
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Active' },
      expiring_soon: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Expiring Soon' },
      expired: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Expired' },
      delivered: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Delivered' },
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending' },
      not_delivered: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Not Delivered' },
      cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Cancelled' },
      leave: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Leave' }
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-3 text-emerald-700 font-medium">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden bg-white shadow-sm border-b border-emerald-100">
        <div className="flex items-center justify-between p-4">
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
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed lg:static inset-y-0 left-0 z-40 w-64 h-[100vh] bg-white shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="py-6 p-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
              <h1 className="text-xl font-bold">
                {/* <i className="fas fa-leaf mr-2"></i> */}
                Fruit Bunch Admin
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                {/* <i className="fas fa-truck mr-1"></i> */}
                Sustainable Delivery Management
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {[
                { id: 'subscriptions', label: 'Subscriptions', icon: 'fa-chart-pie' },
                { id: 'orders', label: 'Orders', icon: 'fa-box' },
                { id: 'attendance', label: 'Attendance', icon: 'fa-users' },
                { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeTab === tab.id
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
                {/* <i className="fas fa-calendar-day mr-2"></i> */}
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 capitalize">
                    {/* <i className={`fas ${
                      activeTab === 'subscriptions' ? 'fa-chart-pie' :
                      activeTab === 'orders' ? 'fa-box' :
                      activeTab === 'attendance' ? 'fa-users' :
                      'fa-chart-line'
                    } mr-3`}></i> */}
                    {activeTab.replace('_', ' ')}
                  </h1>
                  <p className="text-gray-600">
                    {/* <i className="fas fa-cog mr-1"></i> */}
                    Manage your delivery operations efficiently
                  </p>
                </div>
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      <i className="fas fa-user-shield mr-1"></i>
                      Welcome back, Admin
                    </div>
                    <div className="text-xs text-gray-500">
                      <i className="fas fa-sync-alt mr-1"></i>
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

          {/* Main Content Area */}
          <div className="p-6">
            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">User Subscriptions</h2>
                      <p className="text-emerald-700">
                        {/* <i className="fas fa-info-circle mr-1"></i> */}
                        Active subscriptions and customer management
                      </p>
                    </div>
                    <div className="text-2xl text-emerald-600">
                      <i className="fas fa-users"></i>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-user mr-1"></i> */}
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-star mr-1"></i> */}
                          Subscription
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-circle mr-1"></i> */}
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-shopping-cart mr-1"></i> */}
                          Orders
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-rupee-sign mr-1"></i> */}
                          Total Spent
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-cog mr-1"></i> */}
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscriptions.map((subscription) => (
                        <tr key={subscription.user.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center text-white font-semibold">
                                <i className="fas fa-user"></i>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {subscription.user.name || 'No Name'}
                                </div>
                                <div className="text-sm text-gray-500">{subscription.user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {subscription.activeSubscription ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {/* <i className="fas fa-cube mr-1"></i> */}
                                  {subscription.activeSubscription.items?.[0]?.name || 'Subscription'}
                                </div>
                                <div className="text-sm text-emerald-600 font-semibold">
                                  {/* <i className="fas fa-calendar-day mr-1"></i> */}
                                  {subscription.activeSubscription.daysLeft} days left
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">
                                <i className="fas fa-times mr-1"></i>
                                No active subscription
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {subscription.activeSubscription ? (
                              getStatusBadge(subscription.activeSubscription.status)
                            ) : (
                              getStatusBadge('expired')
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            <i className="fas fa-hashtag mr-1"></i>
                            {subscription.totalOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                            <i className="fas fa-rupee-sign mr-1"></i>
                            {subscription.totalSpent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => subscription.orders.length > 0 && openOrderModal(subscription.orders[0])}
                              className="text-emerald-600 hover:text-emerald-800 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                            >
                              <i className="fas fa-eye mr-1"></i>
                              View
                            </button>
                            {/* <button
                              onClick={() => handleCancelToday(subscription.user.id)}
                              className="text-amber-600 hover:text-amber-800 px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
                            >
                              <i className="fas fa-ban mr-1"></i>
                              Cancel
                            </button> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
                      <p className="text-emerald-700">
                        {/* <i className="fas fa-truck mr-1"></i> */}
                        Track and manage all delivery orders
                      </p>
                    </div>
                    <div className="text-2xl text-emerald-600">
                      <i className="fas fa-boxes"></i>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-hashtag mr-1"></i> */}
                          Order ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-user mr-1"></i> */}
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-rupee-sign mr-1"></i> */}
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-calendar mr-1"></i> */}
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-circle mr-1"></i> */}
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {/* <i className="fas fa-cog mr-1"></i> */}
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-emerald-600">
                            <i className="fas fa-hashtag mr-1"></i>
                            #{order.id.slice(-8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {/* <i className="fas fa-user mr-1"></i> */}
                            {subscriptions.find(sub => sub.user.id === order.userId)?.user.name || 'Unknown User'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                            <i className="fas fa-rupee-sign mr-1"></i>
                            {order.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {/* <i className="fas fa-clock mr-1"></i> */}
                            {order.createdAt.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.deliveryStatus || 'pending')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => openOrderModal(order)}
                              className="text-emerald-600 hover:text-emerald-800 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                            >
                              <i className="fas fa-eye mr-1"></i>
                              View
                            </button>
                            {/* <select
                              value={order.deliveryStatus || 'pending'}
                              onChange={(e) => updateDeliveryStatus(order.id, e.target.value)}
                              className="text-sm border border-emerald-200 rounded-lg px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                              <option value="pending">
                                <i className="fas fa-hourglass-half"></i> Pending
                              </option>
                              <option value="delivered">
                                <i className="fas fa-check-circle"></i> Delivered
                              </option>
                              <option value="not_delivered">
                                <i className="fas fa-times-circle"></i> Not Delivered
                              </option>
                            </select> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                  <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Daily Attendance</h2>
                        <p className="text-emerald-700">
                          Track delivery performance and attendance for {selectedDate}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="border border-emerald-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <div className="text-2xl text-emerald-600">
                          <i className="fas fa-calendar-check"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-6 rounded-2xl text-white shadow-lg">
                        <div className="text-3xl font-bold">
                          {attendanceData.totalOrders || 0}
                        </div>
                        <div className="text-emerald-100">Total Orders</div>
                        <div className="text-xs text-emerald-200 mt-2">
                          All scheduled deliveries
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
                        <div className="text-3xl font-bold">
                          {attendanceData.delivered || 0}
                        </div>
                        <div className="text-emerald-100">Successful Deliveries</div>
                        <div className="text-xs text-emerald-200 mt-2">
                          Completed orders
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg">
                        <div className="text-3xl font-bold">
                          {attendanceData.notDelivered || 0}
                        </div>
                        <div className="text-amber-100">Pending Actions</div>
                        <div className="text-xs text-amber-200 mt-2">
                          Requires attention
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mb-4">
                      <button
                        onClick={handleGlobalLeave}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Mark Today as Leave for All
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Days Left
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Delivery Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {attendanceData.orders?.map((order) => (
                            <tr key={order.id} className="hover:bg-emerald-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center text-white font-semibold">
                                    {order.customerName?.charAt(0) || 'U'}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {order.customerName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {order.shippingAddress?.address?.substring(0, 30)}...
                                    </div>
                                    <button
                                      onClick={() => openAttendanceModal(order)}
                                      className="text-emerald-600 hover:text-emerald-800 text-xs mt-1 flex items-center"
                                    >
                                      <i className="fas fa-eye mr-1"></i> View Details
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${order.daysLeft <= 7 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {order.daysLeft}
                                  </div>
                                  <div className="text-xs text-gray-500">days remaining</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(order.deliveryStatus || 'pending')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <select
                                  value={order.deliveryStatus || 'pending'}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "cancel") {
                                      handleCancelDay(order.id);
                                    } else {
                                      updateDeliveryStatus(order.id, value);
                                    }
                                  }}
                                  className="text-sm border border-emerald-200 rounded-lg px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="not_delivered">Not Delivered</option>
                                  <option value="leave">Leave</option>
                                  <option value="cancel">Cancel Today</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                          {(!attendanceData.orders || attendanceData.orders.length === 0) && (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                No deliveries scheduled for {selectedDate}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-6 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-100">
                        <i className="fas fa-users mr-2"></i>
                        Total Users
                      </h3>
                      <div className="text-3xl font-bold mt-2">{subscriptions.length}</div>
                    </div>
                    <div className="text-3xl">
                      <i className="fas fa-user-friends"></i>
                    </div>
                  </div>
                  <div className="text-emerald-200 text-sm mt-4">
                    <i className="fas fa-chart-line mr-1"></i>
                    Active subscribers
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-100">
                        <i className="fas fa-shopping-cart mr-2"></i>
                        Total Orders
                      </h3>
                      <div className="text-3xl font-bold mt-2">{orders.length}</div>
                    </div>
                    <div className="text-3xl">
                      <i className="fas fa-boxes"></i>
                    </div>
                  </div>
                  <div className="text-emerald-200 text-sm mt-4">
                    <i className="fas fa-truck mr-1"></i>
                    All-time deliveries
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-6 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-100">
                        <i className="fas fa-rupee-sign mr-2"></i>
                        Total Revenue
                      </h3>
                      <div className="text-3xl font-bold mt-2">
                        ₹{orders.reduce((sum, order) => sum + (order.amount || 0), 0)}
                      </div>
                    </div>
                    <div className="text-3xl">
                      <i className="fas fa-money-bill-wave"></i>
                    </div>
                  </div>
                  <div className="text-emerald-200 text-sm mt-4">
                    <i className="fas fa-trending-up mr-1"></i>
                    Lifetime earnings
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-2xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Order Details</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-white hover:text-emerald-200 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Order Information</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">Order ID:</span>
                      <span className="text-sm font-semibold text-emerald-600">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">User:</span>
                      <span className="text-sm font-semibold text-emerald-600">{selectedOrder.shipping?.firstName} {selectedOrder.shipping?.lastName}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">Date:</span>
                      <span className="text-sm font-semibold text-emerald-600">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">Amount:</span>
                      <span className="text-sm font-semibold text-emerald-600">₹{selectedOrder.amount}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span>{getStatusBadge(selectedOrder.deliveryStatus)}</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-4 mt-6 text-lg">Delivery Address</h4>
                  <div className="space-y-2">
                    <p className="font-medium">{selectedOrder.shipping?.address}</p>
                    <p className="text-gray-600">{selectedOrder.shipping?.city}, {selectedOrder.shipping?.state}</p>
                    <p className="text-gray-600">{selectedOrder.shipping?.pincode}, {selectedOrder.shipping?.country}</p>
                    <p className="text-gray-600">Email: {selectedOrder.shipping?.email}</p>
                    <p className="text-gray-600">Phone: {selectedOrder.shipping?.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Delivery Location</h4>
                  {selectedOrder.shipping?.location ? (
                    <MapContainer
                      center={[selectedOrder.shipping.location.lat, selectedOrder.shipping.location.lng]}
                      zoom={13}
                      scrollWheelZoom={false}
                      className="w-full h-64 rounded-xl"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
                        url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                      />
                      <Marker
                        position={[selectedOrder.shipping.location.lat, selectedOrder.shipping.location.lng]}
                        icon={markerIcon}
                      >
                        <Popup>Delivery Location</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <p className="text-gray-500">Location not available</p>
                  )}
                  <h4 className="font-semibold text-gray-900 mb-4 mt-6 text-lg">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-emerald-600">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-emerald-600">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Attendance Order Details Modal */}
      {showAttendanceModal && selectedAttendanceOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-2xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Delivery Details</h3>
              <button onClick={() => setShowAttendanceModal(false)} className="text-white hover:text-emerald-200 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Customer Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">Name:</span>
                      <span className="text-sm font-semibold text-emerald-600">{selectedAttendanceOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <span className="text-sm font-semibold text-emerald-600">{selectedAttendanceOrder.shipping?.email}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">Phone:</span>
                      <span className="text-sm font-semibold text-emerald-600">{selectedAttendanceOrder.shipping?.phone}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">Days Left:</span>
                      <span className="text-sm font-semibold text-emerald-600">{selectedAttendanceOrder.daysLeft} days</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span>{getStatusBadge(selectedAttendanceOrder.deliveryStatus)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Delivery Address</h4>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-medium text-gray-900">{selectedAttendanceOrder.shippingAddress?.address}</p>
                    <p className="text-gray-600 mt-1">{selectedAttendanceOrder.shippingAddress?.city}, {selectedAttendanceOrder.shippingAddress?.state}</p>
                    <p className="text-gray-600">Pincode: {selectedAttendanceOrder.shippingAddress?.pincode}</p>
                    <p className="text-gray-600">Country: {selectedAttendanceOrder.shippingAddress?.country}</p>
                  </div>
                </div>

                {selectedAttendanceOrder.shippingAddress?.location && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">Delivery Location</h4>
                    <MapContainer
                      center={[selectedAttendanceOrder.shippingAddress.location.lat, selectedAttendanceOrder.shippingAddress.location.lng]}
                      zoom={15}
                      scrollWheelZoom={false}
                      className="w-full h-64 rounded-xl"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
                        url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                      />
                      <Marker
                        position={[selectedAttendanceOrder.shippingAddress.location.lat, selectedAttendanceOrder.shippingAddress.location.lng]}
                        icon={markerIcon}
                      >
                        <Popup>Delivery Location for {selectedAttendanceOrder.customerName}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Update Delivery Status</h4>
                  <select
                    value={selectedAttendanceOrder.deliveryStatus || 'pending'}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "cancel") {
                        handleCancelDay(selectedAttendanceOrder.id);
                        setShowAttendanceModal(false);
                      } else {
                        updateDeliveryStatus(selectedAttendanceOrder.id, value);
                        setShowAttendanceModal(false);
                      }
                    }}
                    className="w-full text-sm border border-emerald-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="delivered">Delivered</option>
                    <option value="not_delivered">Not Delivered</option>
                    <option value="leave">Leave</option>
                    <option value="cancel">Cancel Today</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;