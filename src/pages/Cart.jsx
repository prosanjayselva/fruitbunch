import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const handleProceedToCheckout = () => {
    setIsProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-lg text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/subscription"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Cart Items ({cartItems.length})</h2>

            <div className="space-y-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center border-b border-gray-100 pb-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium text-gray-800 text-lg">{item.name}</h3>
                    <p className="text-green-600 font-bold">₹{item.price}</p>
                  </div>
                  <div className="flex items-center ml-4">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-l-md"
                    >
                      -
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center bg-gray-50">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-r-md"
                    >
                      +
                    </button>
                  </div>
                  <div className="ml-6 hidden md:block">
                    <p className="font-bold text-green-600">₹{item.price * item.quantity}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-6 text-red-500 hover:text-red-700 hidden md:block"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Link
                to="/subscription"
                className="flex items-center text-green-600 hover:text-green-800 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
              </Link>

              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>

            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery Fee</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{cartTotal}</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/checkout"
                onClick={handleProceedToCheckout}
                disabled={isProcessing}
                className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;