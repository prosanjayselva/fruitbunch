import React from "react";
import { HashRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import AdminRoute from "./utils/AdminRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Subscription from "./pages/Subscription";
import Corporate from "./pages/Corporate";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { CartProvider } from "./context/CartContext";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import OrderConfirmation from "./pages/OrderConfirm";
import AdminPanel from "./pages/AdminPanel";
import TermsAndConditions from "./pages/TermsAndCondition";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ScrollToTop from "./components/ScrollToTop";

// Layout with Navbar + Footer
function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      {/* HashRouter ensures GitHub Pages works */}
      <Router>
        <Routes>
          {/* Routes with Navbar/Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/corporate" element={<Corporate />} />
            <Route path="/about" element={<About />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orderconfirmation" element={<OrderConfirmation />} />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route path="/termsandconditions" element={<TermsAndConditions />} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          </Route>

          {/* Routes without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

          {/* Redirect unknown to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;