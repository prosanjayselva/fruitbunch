import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Active' },
      expiring_soon: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Expiring Soon' },
      expired: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Expired' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-3 text-emerald-700 font-medium">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="px-4 lg:px-6 py-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">User Subscriptions</h2>
            <p className="text-emerald-700 text-sm">
              Active subscriptions and customer management
            </p>
          </div>
          <div className="text-xl lg:text-2xl text-emerald-600">
            <i className="fas fa-users"></i>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Total Spent
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((subscription) => (
              <tr key={subscription.user.id} className="hover:bg-emerald-50/50 transition-colors">
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.user.name || 'No Name'}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[120px] lg:max-w-none">
                        {subscription.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  {subscription.activeSubscription ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.activeSubscription.items?.[0]?.name || 'Subscription'}
                      </div>
                      <div className="text-sm text-emerald-600 font-semibold">
                        {subscription.activeSubscription.daysLeft} days left
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No active subscription</span>
                  )}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  {subscription.activeSubscription ? (
                    getStatusBadge(subscription.activeSubscription.status)
                  ) : (
                    getStatusBadge('expired')
                  )}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {subscription.totalOrders}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                  ₹{subscription.totalSpent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionsPage;