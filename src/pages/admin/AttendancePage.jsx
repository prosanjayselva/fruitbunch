import React, { useState, useEffect } from 'react';
import {
  collection, getDocs, query, orderBy, where,
  doc, updateDoc, addDoc, getDoc, Timestamp
} from 'firebase/firestore';
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

  // 🔹 Fetch active orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          expiryDate: data.expiryDate?.toDate?.() || null,
          customerName: `${data.shipping?.firstName || ''} ${data.shipping?.lastName || ''}`.trim() || 'Unknown Customer',
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
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch attendance logs for the selected date
  const fetchAttendanceData = async () => {
    try {
      // Get all attendance docs for current orders
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("orderId", "in", orders.map(o => o.id))
      );
      const snapshot = await getDocs(attendanceQuery);

      const attendanceRecords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Merge with orders
      const merged = orders
        .filter(order => {
          if (!order.expiryDate) return false;

          const orderDate = new Date(order.createdAt);
          const expiryDate = new Date(order.expiryDate);

          // Include only if selectedDate is within the active period
          const selected = new Date(selectedDate);
          return selected >= orderDate && selected <= expiryDate;
        })
        .map(order => {
          const att = attendanceRecords.find(a => a.orderId === order.id);

          // Look up selectedDate inside days[]
          const dayStatus = att?.days?.find(d => d.date === selectedDate)?.status || "pending";

          return {
            ...order,
            deliveryStatus: dayStatus,
            attendanceId: att?.id || null,
            daysLeft: calculateDaysLeft(order.expiryDate),
          };
        });

      setAttendanceData({
        date: selectedDate,
        totalOrders: merged.length,
        delivered: merged.filter(o => o.deliveryStatus === "delivered").length,
        notDelivered: merged.filter(o =>
          ["pending", "not_delivered"].includes(o.deliveryStatus)
        ).length,
        orders: merged
      });
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  // 🔹 Days left (from expiryDate only)
  const calculateDaysLeft = (expiryDate) => {
    if (!expiryDate) return 0;

    const now = new Date();
    const expiry = new Date(expiryDate);

    // If expiry date is in the past, return 0
    if (expiry < now) return 0;

    let count = 0;
    let currentDate = new Date(now);

    // Set both dates to start of day for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    while (currentDate < expiry) {
      // Skip Sunday (0 = Sunday)
      if (currentDate.getDay() !== 0) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  };

  // 🔹 Update single order status
  const updateDeliveryStatus = async (order, status) => {
    try {
      const confirmMsg =
        status === "not_delivered"
          ? "Are you sure you want to mark this order as 'Not Delivered'? It will still be recorded as 'Delivered'."
          : `Are you sure you want to mark this order as '${status.replace("_", " ")}'?`;

      const confirmed = window.confirm(confirmMsg);
      if (!confirmed) return;
      let finalStatus = status;

      // If customer not available → still mark as delivered
      if (status === "not_delivered") {
        finalStatus = "delivered";
      }

      if (!order.attendanceId) {
        console.error("No attendanceId found for order:", order.id);
        return;
      }

      const attRef = doc(db, "attendance", order.attendanceId);
      const attSnap = await getDoc(attRef);

      if (!attSnap.exists()) {
        console.error("Attendance document not found for order:", order.id);
        return;
      }

      let { days } = attSnap.data();

      // Update only the selectedDate
      days = days.map(d =>
        d.date === selectedDate ? { ...d, status } : d
      );

      await updateDoc(attRef, {
        days,
        updatedAt: Timestamp.now(),
      });

      // Update order record as well
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        deliveryStatus: finalStatus,
        updatedAt: Timestamp.now(),
      });

      fetchAttendanceData();
    } catch (error) {
      console.error("Error updating delivery status:", error);
    }
  };

  const markUserSkip = async (order) => {
    try {
      if (!order.attendanceId) {
        console.error("No attendanceId found for order:", order.id);
        return;
      }

      const today = new Date();
      const targetDate = new Date(selectedDate);

      // Prevent editing past dates
      if (targetDate < new Date(today.setHours(0, 0, 0, 0))) {
        alert("Cannot update attendance for past dates.");
        return;
      }

      const attRef = doc(db, "attendance", order.attendanceId);
      const attSnap = await getDoc(attRef);
      if (!attSnap.exists()) return;

      let { days } = attSnap.data();
      const dayIndex = days.findIndex(d => d.date === selectedDate);

      // 1️⃣ Mark today's skip
      if (dayIndex === -1) {
        days.push({ date: selectedDate, status: "leave_user" });
      } else {
        const currentStatus = days[dayIndex].status;
        if (["leave_user", "leave_company"].includes(currentStatus)) {
          alert("Already marked as leave for this date.");
          return;
        }
        days[dayIndex].status = "leave_user";
      }

      await updateDoc(attRef, { days, updatedAt: Timestamp.now() });

      // 2️⃣ Extend order expiry only once per skipped date
      const orderRef = doc(db, "orders", order.id);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();

      const extendedDates = orderData.extendedDates || [];
      if (!extendedDates.includes(selectedDate)) {
        const newExpiry = new Date(orderData.expiryDate.toDate());
        newExpiry.setDate(newExpiry.getDate() + 1);
        extendedDates.push(selectedDate);

        await updateDoc(orderRef, {
          expiryDate: Timestamp.fromDate(newExpiry),
          extendedDates,
        });

        // 3️⃣ Add next day (pending) in attendance - Skip Sundays
        const lastDate = days[days.length - 1]?.date;
        const nextDate = new Date(lastDate || selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);

        // Skip Sunday (0 = Sunday)
        if (nextDate.getDay() === 0) {
          nextDate.setDate(nextDate.getDate() + 1); // Skip to Monday
        }

        const nextDateString = nextDate.toISOString().split("T")[0];

        // Prevent duplicate push if already exists
        if (!days.some(d => d.date === nextDateString)) {
          days.push({ date: nextDateString, status: "pending" });
          await updateDoc(attRef, { days, updatedAt: Timestamp.now() });
        }
      }

      fetchAttendanceData();
      alert("User skip marked successfully.");
    } catch (error) {
      console.error("Error marking user skip:", error);
      alert("Failed to mark skip. Please try again.");
    }
  };

  const handleGlobalLeave = async () => {
    try {
      const today = new Date();
      const targetDate = new Date(selectedDate);

      // Prevent marking past dates
      if (targetDate < new Date(today.setHours(0, 0, 0, 0))) {
        alert("Cannot mark global leave for past dates.");
        return;
      }

      const activeOrders = attendanceData.orders || [];
      if (activeOrders.length === 0) {
        alert("No active orders found.");
        return;
      }

      const promises = activeOrders.map(async (order) => {
        if (!order.attendanceId) return;

        const attRef = doc(db, "attendance", order.attendanceId);
        const attSnap = await getDoc(attRef);
        if (!attSnap.exists()) return;

        let { days } = attSnap.data();
        const dayIndex = days.findIndex(d => d.date === selectedDate);

        // 1️⃣ Mark selected date as leave_company
        if (dayIndex === -1) {
          days.push({ date: selectedDate, status: "leave_company" });
        } else {
          const currentStatus = days[dayIndex].status;
          if (["leave_company", "leave_user"].includes(currentStatus)) return;
          days[dayIndex].status = "leave_company";
        }

        await updateDoc(attRef, { days, updatedAt: Timestamp.now() });

        // 2️⃣ Extend expiry only once per date
        const orderRef = doc(db, "orders", order.id);
        const orderSnap = await getDoc(orderRef);
        const orderData = orderSnap.data();

        const extendedDates = orderData.extendedDates || [];
        if (!extendedDates.includes(selectedDate)) {
          const newExpiry = new Date(orderData.expiryDate.toDate());
          newExpiry.setDate(newExpiry.getDate() + 1);
          extendedDates.push(selectedDate);

          await updateDoc(orderRef, {
            expiryDate: Timestamp.fromDate(newExpiry),
            extendedDates,
          });

          // 3️⃣ Add next day (pending) in attendance - Skip Sundays
          const lastDate = days[days.length - 1]?.date;
          const nextDate = new Date(lastDate || selectedDate);
          nextDate.setDate(nextDate.getDate() + 1);

          // Skip Sunday (0 = Sunday)
          if (nextDate.getDay() === 0) {
            nextDate.setDate(nextDate.getDate() + 1); // Skip to Monday
          }

          const nextDateString = nextDate.toISOString().split("T")[0];

          if (!days.some(d => d.date === nextDateString)) {
            days.push({ date: nextDateString, status: "pending" });
            await updateDoc(attRef, { days, updatedAt: Timestamp.now() });
          }
        }
      });

      await Promise.all(promises);

      fetchAttendanceData();
      alert("Company holiday marked successfully. Expiry extended by 1 day for all active orders.");
    } catch (error) {
      console.error("Error marking global leave:", error);
      alert("Failed to mark company leave. Please try again.");
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Delivered' },
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'N/A' },
      not_delivered: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Customer not available' },
      leave_user: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Skipped by Customer' },
      leave_company: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Company Holiday' },
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
        {/* Header */}
        <div className="px-4 lg:px-6 py-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Daily Attendance</h2>
              <p className="text-emerald-700 text-sm">Track delivery performance for {selectedDate}</p>
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

        {/* Stats */}
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-4 lg:p-6 rounded-2xl text-white shadow-lg">
              <div className="text-2xl lg:text-3xl font-bold">{attendanceData.totalOrders || 0}</div>
              <div className="text-emerald-100 text-sm lg:text-base">Total Orders</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 lg:p-6 rounded-2xl text-white shadow-lg">
              <div className="text-2xl lg:text-3xl font-bold">{attendanceData.delivered || 0}</div>
              <div className="text-emerald-100 text-sm lg:text-base">Successful Deliveries</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 lg:p-6 rounded-2xl text-white shadow-lg">
              <div className="text-2xl lg:text-3xl font-bold">{attendanceData.notDelivered || 0}</div>
              <div className="text-amber-100 text-sm lg:text-base">Pending Actions</div>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button
              onClick={handleGlobalLeave}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm lg:text-base"
            >
              Mark Today as Company Holiday
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Days Left</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Preferred Time</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Delivery Status</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
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
                    <td className="px-4 lg:px-6 py-4">{order.daysLeft}</td>
                    <td className="px-4 lg:px-6 py-4">{order.preferredTime || "Not Set"}</td>
                    <td className="px-4 lg:px-6 py-4">{getStatusBadge(order.deliveryStatus)}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <select
                        value={order.deliveryStatus || ""}
                        onChange={(e) => updateDeliveryStatus(order, e.target.value)}
                        className="text-sm border border-emerald-200 rounded-lg px-2 py-1"
                      >
                        <option value="">Select status</option>
                        <option value="delivered">Delivered</option>
                        <option value="not_delivered">Customer not available</option>
                        <option value="leave_user">Skipped by Customer</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {(!attendanceData.orders || attendanceData.orders.length === 0) && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No deliveries scheduled for {selectedDate}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <AttendanceModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onStatusUpdate={(id, status) => updateDeliveryStatus({ id, ...selectedOrder }, status)}
          onCancelDay={markUserSkip}
        />
      )}
    </div>
  );
};

export default AttendancePage;