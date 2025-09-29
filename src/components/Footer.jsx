import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-green-900 text-white py-12 px-5 md:px-10 text-xs sm:px-10 lg:text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="quicklink">
            <h2 className="text-sm font-bold mb-4 lg:text-xl">Quick Links</h2>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="hover:text-green-300 transition">Home</Link>
              <Link to="/subscription" className="hover:text-green-300 transition">Fruit Bowl Subscription</Link>
              <Link to="/corporate" className="hover:text-green-300 transition">Corporate Orders</Link>
              <Link to="/about" className="hover:text-green-300 transition">About Us</Link>
              <Link to="/termsandconditions" className="hover:text-green-300 transition">Terms and Conditions</Link>
              <Link to="/privacypolicy" className="hover:text-green-300 transition">Privacy Policy</Link>
            </div>
          </div>

          {/* Subscription Services */}
          <div className="footabout">
            <h2 className="text-sm font-bold mb-4 lg:text-xl">Subscription Services</h2>
            <div className="flex flex-col space-y-2">
              <p>Fruit Bowl</p>
              <p>Diet Platter</p>
              <p>Salad Bowls</p>
              <p>Fresh Juice</p>
            </div>
            <div className="mt-4">
              <b className="text-green-300">EAT FRESH. STAY HEALTHY. LIVE BETTER!</b>
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact">
            <h2 className="text-sm font-bold mb-4 lg:text-xl">Contact Us</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <i className="fa-solid fa-phone w-5 mr-2"></i>
                <a href="tel:+918807239379" className="hover:underline">
                  +91 8807239379
                </a>
              </div>

              <div className="flex items-center">
                <i className="fa-solid fa-envelope w-5 mr-2"></i>
                <a href="mailto:fruitbunch.tvm@gmail.com" className="hover:underline">
                  fruitbunch.tvm@gmail.com
                </a>
              </div>
              <div className="flex items-start">
                <i className="fa-solid fa-location-dot w-5 mr-2 mt-1"></i>
                <span>
                  No:59, Sarathambal nagar,<br /> Tiruvannamalai,<br /> Tamil Nadu 606601
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-green-800 mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} Fruit Bunch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;