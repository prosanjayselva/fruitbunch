import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DeliveryHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Filters
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
                expiryDate: doc.data().expiryDate?.toDate?.() || new Date(),
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

    const fetchAttendanceData = async (orderId) => {
        try {
            const attendanceQuery = query(
                collection(db, "attendance"),
                where("orderId", "==", orderId)
            );
            const attendanceSnapshot = await getDocs(attendanceQuery);

            if (!attendanceSnapshot.empty) {
                const attendanceDoc = attendanceSnapshot.docs[0];
                setAttendanceData({
                    id: attendanceDoc.id,
                    ...attendanceDoc.data()
                });
            } else {
                setAttendanceData(null);
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            setAttendanceData(null);
        }
    };

    const handleViewAttendance = async (order) => {
        setSelectedOrder(order);
        await fetchAttendanceData(order.id);
        setShowModal(true);
    };

    const generatePDFReport = () => {
        if (!selectedOrder || !attendanceData) return;

        const doc = new jsPDF();
        const user = subscriptions.find(sub => sub.id === selectedOrder.userId);

        // Header
        doc.setFillColor(236, 253, 245);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(5, 150, 105);
        doc.setFontSize(20);
        doc.text('ATTENDANCE REPORT', 105, 20, { align: 'center' });

        // Order Information
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Order ID: #${selectedOrder.id.slice(-8)}`, 14, 50);
        doc.text(`Customer: ${user?.name || 'Unknown User'}`, 14, 58);
        doc.text(`Package: ${selectedOrder.items?.map(item => item.name).join(", ") || 'N/A'}`, 14, 66);
        doc.text(`Period: ${selectedOrder.createdAt.toLocaleDateString()} - ${selectedOrder.expiryDate.toLocaleDateString()}`, 14, 74);

        // Attendance Table - Use autoTable function directly
        const tableColumn = ["Date", "Day", "Status"];
        const tableRows = [];

        attendanceData.days.forEach(day => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const statusLabels = {
                delivered: 'Delivered',
                pending: 'N/A',
                not_delivered: 'Customer not available',
                leave_user: 'Skipped by Customer',
                leave_company: 'Company Holiday'
            };

            const statusLabel = statusLabels[day.status] || day.status;

            tableRows.push([
                date.toLocaleDateString(),
                dayName,
                statusLabel
            ]);
        });

        // Use autoTable directly instead of doc.autoTable
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 85,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [5, 150, 105] },
            alternateRowStyles: { fillColor: [240, 253, 244] }
        });

        // Summary
        const totalDays = attendanceData.days.length;
        const completedDays = attendanceData.days.filter(day => day.status === 'completed').length;
        const pendingDays = attendanceData.days.filter(day => day.status === 'pending').length;
        const missedDays = attendanceData.days.filter(day => day.status === 'not_delivered').length;

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Summary: ${completedDays} Completed, ${pendingDays} Pending, ${missedDays} Missed out of ${totalDays} total days`, 14, finalY);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });

        doc.save(`attendance-report-${selectedOrder.id.slice(-8)}.pdf`);
    };

    const getOrderStatus = (order) => {
        const now = new Date();
        const expiryDate = order.expiryDate instanceof Date ? order.expiryDate : new Date(order.expiryDate);

        if (now > expiryDate) {
            return { status: 'Expired', color: 'bg-red-100 text-red-800 border-red-200' };
        } else {
            return { status: 'Active', color: 'bg-green-100 text-green-800 border-green-200' };
        }
    };

    const getAttendanceStatusBadge = (status) => {
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

    // Apply filters
    const filteredOrders = orders.filter(order => {
        if (filterStatus === "All") return true;

        const orderStatus = getOrderStatus(order);
        return orderStatus.status === filterStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="mt-3 text-emerald-700 font-medium">Loading delivery history...</p>
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
                        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Delivery History</h2>
                        <p className="text-emerald-700 text-sm">Track current and expired orders with attendance</p>
                    </div>
                    <div className="text-xl lg:text-2xl text-emerald-600">
                        <i className="fas fa-history"></i> {filteredOrders.length}
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-4 flex flex-wrap gap-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="All">All Orders</option>
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Package</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Expiry Date</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 lg:px-6 py-6 text-center text-sm text-gray-500">
                                    No {filterStatus !== "All" ? filterStatus.toLowerCase() : ""} orders found.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => {
                                const user = subscriptions.find(sub => sub.id === order.userId);
                                const orderStatus = getOrderStatus(order);

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
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                                            {order.expiryDate.toLocaleDateString()}
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${orderStatus.color}`}>
                                                {orderStatus.status}
                                            </span>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleViewAttendance(order)}
                                                className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                                            >
                                                View Attendance
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Attendance Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Attendance History - Order #{selectedOrder?.id.slice(-8)}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition"
                                >
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>
                            {selectedOrder && (
                                <div className="mt-2 text-sm text-emerald-700">
                                    Customer: {subscriptions.find(sub => sub.id === selectedOrder.userId)?.name || 'Unknown User'} |
                                    Package: {selectedOrder.items?.map(item => item.name).join(", ") || 'N/A'} |
                                    Period: {selectedOrder.createdAt.toLocaleDateString()} - {selectedOrder.expiryDate.toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {attendanceData ? (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-medium text-gray-900">Daily Attendance Record</h4>
                                        <button
                                            onClick={generatePDFReport}
                                            className="px-4 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                                        >
                                            {/* <i className="fas fa-download"></i> */}
                                            Download PDF
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {attendanceData.days.map((day, index) => {
                                            const date = new Date(day.date);
                                            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

                                            return (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {date.toLocaleDateString()}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{dayName}</div>
                                                        </div>
                                                        {getAttendanceStatusBadge(day.status)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Summary */}
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <h5 className="font-medium text-gray-900 mb-2">Summary</h5>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-emerald-600">{attendanceData.days.length}</div>
                                                <div className="text-gray-600">Total Days</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {attendanceData.days.filter(day => day.status === 'completed').length}
                                                </div>
                                                <div className="text-gray-600">Completed</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-yellow-600">
                                                    {attendanceData.days.filter(day => day.status === 'pending').length}
                                                </div>
                                                <div className="text-gray-600">Pending</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {attendanceData.days.filter(day => day.status === 'missed').length}
                                                </div>
                                                <div className="text-gray-600">Missed</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500">No attendance data found for this order.</p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryHistoryPage;