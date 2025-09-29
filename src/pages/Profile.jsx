import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { collection, query, where, doc, getDocs, updateDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const db = getFirestore();
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      const fetchOrders = async () => {
        try {
          const ordersRef = collection(db, "orders");
          const q = query(ordersRef, where("userId", "==", userData.uid));

          const querySnapshot = await getDocs(q);

          const orderList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setOrders(orderList);

          if (orderList.length > 0) {
            const latestOrder = orderList[0];

            // Calculate expiry (start + 26 days)
            const startDate = latestOrder.createdAt?.toDate?.() || new Date();
            const expiryDate = new Date(startDate);
            expiryDate.setDate(startDate.getDate() + 26);

            const now = new Date();
            const isExpired = now > expiryDate;

            if (!isExpired) {
              const daysLeft = Math.max(
                0,
                Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
              );
              setSubscription({
                plan: latestOrder.items?.[0]?.name || "Standard",
                product: latestOrder.items?.[0]?.description || "Subscription",
                status: latestOrder.status,
                startDate: startDate.toISOString(),
                expiryDate: expiryDate.toISOString(),
                price: `₹${latestOrder.amount}`,
                daysLeft,
              });
            } else {
              setSubscription(null);
            }
          }
        } catch (err) {
          console.error("Error fetching orders:", err);
        }
      };

      fetchOrders();
    }
    setIsLoading(false);
  }, [db]);


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
                  <span>Subscription</span>
                </button>
                {/* <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Security</span>
                </a> */}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Subscription Details */}
            {activeTab === "subscription" ? (
              <>
                {subscription ? (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">Current Subscription</h3>
                          <p className="text-green-100">Active plan with premium features</p>
                        </div>
                        <div className="bg-white text-green-600 px-4 py-2 rounded-full font-semibold">
                          {subscription.plan}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-gray-900">Product</h4>
                          <p className="text-gray-600 text-sm">{subscription.product}..more</p>
                        </div>

                        <div className="text-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-gray-900">Expiry Date</h4>
                          <p className="text-gray-600 text-sm">{new Date(subscription.expiryDate).toLocaleDateString()}</p>
                        </div>

                        <div className="text-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-gray-900">Price</h4>
                          <p className="text-gray-600 text-sm">{subscription.price}</p>
                        </div>

                        <div className="text-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-gray-900">Days Left</h4>
                          <p className="text-gray-600 text-sm">{subscription.daysLeft} days</p>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-6">
                        <button onClick={() => navigate("/subscription")} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Renew Subscription
                        </button>
                        <button onClick={() => navigate("/subscription")} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition duration-200 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Change Plan
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-center">
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Subscription Expired</h3>
                    <p className="text-gray-600 mb-4">
                      Your subscription has expired. Please renew to continue enjoying premium features.
                    </p>
                    <button onClick={() => navigate("/subscription")} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200">
                      Renew Now
                    </button>
                  </div>
                )}

                {/* Order History */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orders.map((order, index) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-green-600">{index + 1}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{order.items?.[0]?.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{order.items?.[0]?.description}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{new Date(order.createdAt?.toDate?.()).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">Rs: {order.amount}</td>
                              {/* <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {order.status}
                            </span>
                          </td> */}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Personal Information */}
                < div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                        <div className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Active
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                    <div className="flex flex-wrap gap-4">
                      {/* <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button> */}
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
    </div >
  );
};

export default Profile;