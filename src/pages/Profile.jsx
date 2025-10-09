import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { collection, query, where, doc, getDocs, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const db = getFirestore();
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]); // Changed to array for multiple subscriptions
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      fetchSubscriptions(userData.uid); // Updated function name
      fetchAttendanceHistory(userData.uid);
    }
  }, []);

  // 🔹 Fetch ALL active subscriptions: non-expired orders
  const fetchSubscriptions = async (userId) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      const activeSubscriptions = [];

      if (!snapshot.empty) {
        const orders = snapshot.docs
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds); // latest first

        for (const order of orders) {
          const startDate = order.createdAt?.toDate?.() || new Date();
          const expiryDate = new Date(startDate);
          expiryDate.setDate(startDate.getDate() + 26);

          if (new Date() <= expiryDate) {
            const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            
            activeSubscriptions.push({
              id: order.id,
              plan: order.items?.[0]?.name || "Standard",
              product: order.items?.[0]?.description || "Subscription",
              status: order.status,
              paymentStatus: order.paymentStatus,
              startDate: startDate.toISOString(),
              expiryDate: expiryDate.toISOString(),
              price: `₹${order.amount}`,
              daysLeft,
              createdAt: order.createdAt
            });
          }
        }
      }

      setSubscriptions(activeSubscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Fetch delivery history from attendance collection
  const fetchAttendanceHistory = async (userId) => {
    try {
      const attRef = collection(db, "attendance");
      const q = query(attRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let records = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Get related order
        const orderRef = doc(db, "orders", data.orderId);
        const orderSnap = await getDoc(orderRef);
        const orderData = orderSnap.exists() ? orderSnap.data() : {};

        // Expand each day in `days[]` into its own record
        const dailyRecords = data.days.map((d) => ({
          id: docSnap.id, // attendance doc id (same for all days)
          date: d.date,
          status: d.status,
          plan: orderData.items?.[0]?.name || "Unknown",
          description: orderData.items?.[0]?.description || "Unknown",
          amount: orderData.amount || 0,
          orderId: data.orderId // Add orderId to link with subscription
        }));

        records.push(...dailyRecords);
      }

      // ✅ Filter: only past + current days
      const pastAndCurrent = records.filter((rec) => {
        const recordDate = new Date(rec.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate <= today;
      });

      // Sort chronologically
      setAttendanceRecords(
        pastAndCurrent.sort((a, b) => new Date(a.date) - new Date(b.date))
      );
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Delivered' },
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'N/A' },
      not_delivered: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Not Delivered' },
      leave_user: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Skip by Customer' },
      leave_company: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Company Holiday' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    return <span className={`inline-flex items-center capitalize px-1 md:px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>{config.label}</span>;
  };

  // Filter attendance records by subscription/order ID
  const getAttendanceForSubscription = (subscriptionId) => {
    return attendanceRecords.filter(record => record.orderId === subscriptionId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your profile</p>
          <a href="/login" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={`https://ui-avatars.com/api/?background=10b981&color=fff&size=128&name=${encodeURIComponent(user.name)}&bold=true`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg"
                  />
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <h2 className="text-xl font-semibold mt-4 text-gray-900">{user.name}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left ${activeTab === "profile" ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab("subscription")}
                  className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left ${activeTab === "subscription" ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Subscription{subscriptions.length > 1 ? `s (${subscriptions.length})` : ''}</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Subscription Details */}
            {activeTab === "subscription" ? (
              <>
                {subscriptions.length > 0 ? (
                  subscriptions.map((subscription, index) => (
                    <div key={subscription.id} className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-md md:text-xl font-semibold text-white mb-2">
                              Subscription {subscriptions.length > 1 ? `#${index + 1}` : ''}
                            </h3>
                            <p className="text-green-100 text-xs md:text-sm">
                              {subscriptions.length > 1 ? 'Additional active plan' : 'Active plan with premium features'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <div className="text-xs md:text-sm bg-white text-green-600 px-3 md:px-4 py-2 rounded-full font-semibold">
                              {subscription.paymentStatus}
                            </div>
                            <div className="text-xs md:text-sm bg-white text-green-600 px-3 md:px-4 py-2 rounded-full font-semibold">
                              {subscription.plan}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900">Product</h4>
                            <p className="text-gray-600 text-sm">{subscription.product.length > 10 ? `${subscription.product.slice(0, 10)}..more` : subscription.product}</p>
                          </div>

                          <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900">Expiry Date</h4>
                            <p className="text-gray-600 text-sm">{new Date(subscription.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-")}</p>
                          </div>

                          <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <text x="4" y="18" fontSize="22" fontWeight="thin" fill="currentColor">₹</text>
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900">Price</h4>
                            <p className="text-gray-600 text-sm">{subscription.price}</p>
                          </div>

                          <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-32 h-32 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900">Days Left</h4>
                            <p className="text-gray-600 text-sm">{subscription.daysLeft} days</p>
                          </div>
                        </div>

                        {/* Subscription-specific delivery history */}
                        <div className="mt-8">
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Delivery History for this Subscription</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                  <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {(() => {
                                  const subscriptionAttendance = getAttendanceForSubscription(subscription.id);
                                  return subscriptionAttendance.length > 0 ? (
                                    subscriptionAttendance.map((record, idx) => (
                                      <tr key={`${record.id}-${idx}`} className="hover:bg-gray-50">
                                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm font-medium text-green-600">{idx + 1}</td>
                                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900">
                                          {new Date(record.date)
                                            .toLocaleDateString("en-GB", {
                                              day: "2-digit",
                                              month: "2-digit",
                                              year: "numeric",
                                            })
                                            .replace(/\//g, "-")}
                                        </td>
                                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900">
                                          {getStatusBadge(record.status)}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="3" className="px-2 md:px-4 py-6 text-center text-gray-500 text-sm">
                                        No delivery records found for this subscription
                                      </td>
                                    </tr>
                                  );
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-6 text-sm md:text-base">
                          <button onClick={() => navigate("/subscription")} className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 rounded-lg transition duration-200 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {subscriptions.length > 1 ? 'Add Another Subscription' : 'Renew Subscription'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-center">
                    <h3 className="text-lg font-semibold text-red-700 mb-2">No Active Subscriptions</h3>
                    <p className="text-gray-600 mb-4">
                      You don't have any active subscriptions. Please subscribe to enjoy our services.
                    </p>
                    <button onClick={() => navigate("/subscription")} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200">
                      Subscribe Now
                    </button>
                  </div>
                )}

                {/* Combined Delivery History (All Subscriptions) */}
                {subscriptions.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-md md:text-lg font-semibold text-gray-900 mb-4">All Delivery History</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                              <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                              <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {attendanceRecords.length > 0 ? (
                              attendanceRecords.map((record, index) => (
                                <tr key={`${record.id}-${index}`} className="hover:bg-gray-50">
                                  <td className="px-2 md:px-4 py-3 text-xs md:text-sm font-medium text-green-600">{index + 1}</td>
                                  <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900">{record.plan}</td>
                                  <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900">
                                    {new Date(record.date)
                                      .toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                      })
                                      .replace(/\//g, "-")}
                                  </td>
                                  <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900">
                                    {getStatusBadge(record.status)}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="px-2 md:px-4 py-6 text-center text-gray-500 text-sm"
                                >
                                  No delivery records found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {user.name}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {user.email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Active Subscriptions</label>
                        <div className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {subscriptions.length} Active
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                    <div className="flex flex-wrap gap-4 text-sm md:text-base">
                      <button onClick={() => navigate("/forgot-password")} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition duration-200 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Change Password
                      </button>
                      <button
                        onClick={() => {
                          const auth = getAuth();
                          signOut(auth)
                            .then(() => {
                              localStorage.removeItem("user");
                              localStorage.removeItem("isAdmin");
                              navigate("/login");
                            })
                            .catch((error) => {
                              console.error("Logout error:", error);
                            });
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center ml-auto"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;