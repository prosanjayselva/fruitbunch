import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import logo from '../assets/images/mainlogo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedIsAdmin = localStorage.getItem("isAdmin");
    if (storedIsAdmin) {
      setIsAdmin(JSON.parse(storedIsAdmin));
    }
  }, []);

  const generateAvatarUrl = (name) => {
    const firstLetter = name.charAt(0).toUpperCase();
    const backgroundColor = "43A047"
    const imageSize = 130;
    return `https://ui-avatars.com/api/?background=${backgroundColor}&size=${imageSize}&color=FFF&font-size=0.60&name=${firstLetter}`;
  };

  return (
    <>
      {/* Top info bar */}
      <div className="bg-green-800 text-white text-xs lg:text-md py-2">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-2 md:mb-0">
            <span className="flex items-center">
              <i className="fa-solid fa-envelope mr-2"></i> fruitbunch.tvm@gmail.com
            </span>
            <span className="flex items-center hidden md:block">
              <i className="fa-solid fa-clock mr-2"></i> MON-SAT: 7.30am - 6.00pm
            </span>
            <span className="flex items-center">
              <i className="fa-solid fa-phone mr-2"></i> +91 8807239379
            </span>
          </div>
          <div className="flex space-x-4 hidden md:block">
            <a href="#" className="hover:text-green-200 transition">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" className="hover:text-green-200 transition">
              <i className="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-[9999]">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Fruit Bunch" className="h-14" />
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-5 lg:space-x-8 text-sm lg:text-md">
            <NavLink to="/" className={({ isActive }) => `font-medium transition ${isActive ? "text-green-600" : "text-gray-700 hover:text-green-600"}`}>Home</NavLink>
            <NavLink to="/subscription" className={({ isActive }) => `font-medium transition ${isActive ? "text-green-600" : "text-gray-700 hover:text-green-600"}`}>Fruit Bowl Subscription</NavLink>
            <NavLink to="/corporate" className={({ isActive }) => `font-medium transition ${isActive ? "text-green-600" : "text-gray-700 hover:text-green-600"}`}>Corporate Orders</NavLink>
            <NavLink to="/about" className={({ isActive }) => `font-medium transition ${isActive ? "text-green-600" : "text-gray-700 hover:text-green-600"}`}>About Us</NavLink>

            <div className="flex items-center space-x-4">
              {!user ? (
                <Link to="/login" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition">
                  Login
                </Link>
              ) : (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-md transition">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/cart" className="relative bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-md transition flex items-center">
                    <i className="fa-solid fa-cart-shopping mr-2"></i> Cart
                    {cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                  <Link to="/profile" className="flex items-center">
                    <img
                      src={generateAvatarUrl(user.name || "U")}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white px-4 pb-4">
            <div className="flex flex-col space-y-3">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-green-600 py-2 transition">Home</Link>
              <Link to="/subscription" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-green-600 py-2 transition">Fruit Bowl Subscription</Link>
              <Link to="/corporate" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-green-600 py-2 transition">Corporate Orders</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-green-600 py-2 transition">About Us</Link>

              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                {!user ? (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-center transition">
                    Login
                  </Link>
                ) : (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-md text-center transition">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="relative bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-md text-center transition flex items-center justify-center">
                      <i className="fa-solid fa-cart-shopping mr-2"></i> Cart
                      {cartItems.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {cartItems.length}
                        </span>
                      )}
                    </Link>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="relative bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-md text-center transition flex items-center justify-center">
                      <i className="fa-solid fa-user mr-2"></i> Profile
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;