import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import AttendanceModal from '../../components/models/AttendanceModal';

const AttendancePage = () => {
  const [orders, setOrders] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      fetchAttendanceData();
    }
  }, [selectedDate, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error('Error fetching orders:', error);
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
    const baseValidityDays = 26;
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
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, deliveryStatus: status } : order
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, deliveryStatus: status }));
      }

      fetchAttendanceData();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      alert('Error updating delivery status');
    }
  };

  const handleCancelDay = async (orderId) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        alert("Order not found");
        return;
      }

      const orderRef = doc(db, "orders", orderId);
      const currentExtraDays = order.extraDays || 0;

      await updateDoc(orderRef, {
        extraDays: currentExtraDays + 1,
        deliveryStatus: "cancelled",
        updatedAt: Timestamp.now(),
        events: arrayUnion({
          type: "cancel",
          date: new Date().toISOString(),
        }),
      });

      await fetchOrders();
      alert("Cancelled today for this user. Timeline extended by 1 day.");
    } catch (error) {
      console.error("Error cancelling day:", error);
      alert("Error cancelling delivery");
    }
  };

  const handleGlobalLeave = async () => {
    try {
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

      await Promise.all(updatePromises);
      await fetchOrders();
      alert("Marked today as leave. Timeline extended by 1 day for all users.");
    } catch (error) {
      console.error("Error marking leave:", error);
      alert("Error marking leave for all users");
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Delivered' },
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending' },
      not_delivered: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Not Delivered' },
      cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Cancelled' },
      leave: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Leave' }
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-3 text-emerald-700 font-medium">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="px-4 lg:px-6 py-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Daily Attendance</h2>
              <p className="text-emerald-700 text-sm">
                Track delivery performance for {selectedDate}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-emerald-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-4 lg:p-6 rounded-2xl text-white shadow-lg">
              <div className="text-2xl lg:text-3xl font-bold">
                {attendanceData.totalOrders || 0}
              </div>
              <div className="text-emerald-100 text-sm lg:text-base">Total Orders</div>
              <div className="text-xs text-emerald-200 mt-2">
                All scheduled deliveries
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 lg:p-6 rounded-2xl text-white shadow-lg">
              <div className="text-2xl lg:text-3xl font-bold">
                {attendanceData.delivered || 0}
              </div>
              <div className="text-emerald-100 text-sm lg:text-base">Successful Deliveries</div>
              <div className="text-xs text-emerald-200 mt-2">
                Completed orders
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 lg:p-6 rounded-2xl text-white shadow-lg">
              <div className="text-2xl lg:text-3xl font-bold">
                {attendanceData.notDelivered || 0}
              </div>
              <div className="text-amber-100 text-sm lg:text-base">Pending Actions</div>
              <div className="text-xs text-amber-200 mt-2">
                Requires attention
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button
              onClick={handleGlobalLeave}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm lg:text-base"
            >
              Mark Today as Leave for All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Days Left
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Delivery Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {order.customerName?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3 lg:ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-xs text-gray-500 max-w-[150px] lg:max-w-none truncate">
                            {order.shippingAddress?.address?.substring(0, 30)}...
                          </div>
                          <button
                            onClick={() => openOrderModal(order)}
                            className="text-emerald-600 hover:text-emerald-800 text-xs mt-1 flex items-center"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${order.daysLeft <= 7 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {order.daysLeft}
                        </div>
                        <div className="text-xs text-gray-500">days remaining</div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.deliveryStatus || 'pending')}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                        className="text-sm border border-emerald-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <AttendanceModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onStatusUpdate={updateDeliveryStatus}
          onCancelDay={handleCancelDay}
        />
      )}
    </div>
  );
};

export default AttendancePage;