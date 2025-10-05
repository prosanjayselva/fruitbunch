import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMethod, setFilterMethod] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      setOrders(ordersData);

      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubscriptions(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      Paid: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Success' },
      Pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      Failed: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Failed' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status || 'Unknown' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Apply filters
  const filteredOrders = orders.filter(order => {
    const methodMatch = filterMethod === "All" || order.paymentMethod === filterMethod;
    const statusMatch = filterStatus === "All" || order.paymentStatus === filterStatus;
    return methodMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-3 text-emerald-700 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 lg:px-6 py-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Order Management</h2>
            <p className="text-emerald-700 text-sm">Track and manage all delivery orders</p>
          </div>
          <div className="text-xl lg:text-2xl text-emerald-600">
            <i className="fas fa-boxes"></i>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-4">
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Methods</option>
            <option value="card">Credit/Debit Card</option>
            <option value="cod">Cash on Delivery</option>
            <option value="upi">UPI</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pack</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Method</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                {filterStatus ? (
                  <td colSpan="7" className="px-4 lg:px-6 py-6 text-center text-sm text-gray-500">
                    No {filterStatus !== "All" ? filterStatus.toLowerCase() : ""} orders found.
                  </td>
                ) : (
                  <td colSpan="7" className="px-4 lg:px-6 py-6 text-center text-sm text-gray-500">
                    No {filterMethod !== "All" ? filterMethod.toLowerCase() : ""} orders found.
                  </td>
                )}
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const user = subscriptions.find(sub => sub.id === order.userId);
                return (
                  <tr key={order.id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm font-mono font-semibold text-emerald-600">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-gray-900">
                      {user?.name || 'Unknown User'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-700">
                      {order.items?.map(item => item.name).join(", ") || 'N/A'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm font-semibold text-emerald-600">
                      ₹{order.amount}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                      {order.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 lg:px-6 py-4 capitalize whitespace-nowrap text-xs lg:text-sm text-gray-700">
                      {order.paymentMethod || 'N/A'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.paymentStatus || 'Pending')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;