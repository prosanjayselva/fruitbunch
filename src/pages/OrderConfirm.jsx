import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";

const OrderConfirmation = () => {
  const location = useLocation();
  const { orderId, payment } = location.state || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", orderId);
        const snapshot = await getDoc(orderRef);
        if (snapshot.exists()) {
          setOrder(snapshot.data());
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    
    // Trigger animation completion after initial load
    const timer = setTimeout(() => setAnimationComplete(true), 2000);
    return () => clearTimeout(timer);
  }, [orderId]);

  if (!orderId) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center px-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-red-500 text-6xl mb-4"
          >
            <i className="fas fa-exclamation-triangle"></i>
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Invalid Order Confirmation
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your order details. Please check your confirmation link.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all duration-300 font-medium"
          >
            <i className="fas fa-home mr-2"></i>
            Go back to Home
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <i className="fas fa-check-circle text-4xl text-white"></i>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4"
          >
            Order Confirmed!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-gray-600"
          >
            Thank you for your purchase! Your order has been successfully placed.
          </motion.p>
        </motion.div>

        {/* Payment Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center mb-8"
        >
          <span className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold ${
            payment === 'success' 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}>
            <i className={`fas ${
              payment === 'success' ? 'fa-check-circle' : 'fa-clock'
            } mr-2`}></i>
            Payment {payment?.toUpperCase()}
          </span>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-emerald-100"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <i className="fas fa-receipt mr-3"></i>
              Order Details
            </h2>
          </div>
          
          <div className="p-6">
            {/* Order ID */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium flex items-center">
                <i className="fas fa-hashtag mr-2 text-emerald-500"></i>
                Order ID
              </span>
              <span className="font-mono font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                #{orderId.slice(-8)}
              </span>
            </div>

            {/* Loading State */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
                  ></motion.div>
                  <p className="text-gray-500">Loading order details...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Order Details */}
            <AnimatePresence>
              {!loading && order && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4 mt-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-xl">
                      <div className="text-sm text-emerald-600 font-medium mb-1">
                        <i className="fas fa-rupee-sign mr-1"></i>
                        Amount
                      </div>
                      <div className="text-lg font-bold text-emerald-700">₹{order.amount}</div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-xl">
                      <div className="text-sm text-green-600 font-medium mb-1">
                        {/* <i className="fas fa-calendar mr-1"></i> */}
                        Date
                      </div>
                      <div className="text-sm font-semibold text-green-700">
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-teal-50 p-4 rounded-xl">
                      <div className="text-sm text-teal-600 font-medium mb-1">
                        {/* <i className="fas fa-flag mr-1"></i> */}
                        Status
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        {order.status || 'Confirmed'}
                      </span>
                    </div>
                    
                    <div className="bg-cyan-50 p-4 rounded-xl">
                      <div className="text-sm text-cyan-600 font-medium mb-1">
                        {/* <i className="fas fa-globe mr-1"></i> */}
                        Plan
                      </div>
                      <div className="text-sm font-semibold text-cyan-700">{order.items[0].name}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error State */}
            <AnimatePresence>
              {!loading && !order && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6 text-red-500"
                >
                  <i className="fas fa-exclamation-circle text-2xl mb-2"></i>
                  <p>Order details not found.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Animated Progress Steps */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-emerald-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <i className="fas fa-truck mr-2 text-emerald-500"></i>
            Order Journey
          </h3>
          
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: animationComplete ? '100%' : '33%' }}
                transition={{ duration: 1.5, delay: 1.5 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
              ></motion.div>
            </div>

            {[
              { icon: 'fa-shopping-cart', label: 'Ordered', status: 'complete' },
              { icon: 'fa-cog', label: 'Processing', status: animationComplete ? 'complete' : 'current' },
              { icon: 'fa-truck', label: 'Shipped', status: 'pending' },
              { icon: 'fa-home', label: 'Delivered', status: 'pending' }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.8 + (index * 0.2) }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white mb-2 ${
                    step.status === 'complete' 
                      ? 'bg-emerald-500 shadow-lg' 
                      : step.status === 'current'
                      ? 'bg-green-400 ring-4 ring-green-200'
                      : 'bg-gray-300'
                  }`}
                >
                  <i className={`fas ${step.icon} text-xs`}></i>
                </motion.div>
                <span className={`text-xs font-medium ${
                  step.status === 'complete' || step.status === 'current'
                    ? 'text-emerald-600'
                    : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div> */}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 font-semibold text-center group"
          >
            <i className="fas fa-shopping-bag mr-2 group-hover:scale-110 transition-transform"></i>
            Continue Shopping
          </Link>
          
          <Link
            to="/profile"
            className="flex-1 border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all duration-300 font-semibold text-center group"
          >
            <i className="fas fa-clipboard-list mr-2 group-hover:scale-110 transition-transform"></i>
            View My Orders
          </Link>
        </motion.div>

        {/* Floating Celebration Elements */}
        <AnimatePresence>
          {animationComplete && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    scale: 0, 
                    opacity: 0,
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50
                  }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 5
                  }}
                  className="fixed text-emerald-400 text-2xl pointer-events-none"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                >
                  <i className="fas fa-star"></i>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderConfirmation;