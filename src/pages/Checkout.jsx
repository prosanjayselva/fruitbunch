import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import axios from "axios";
import { auth, db } from '../../firebaseConfig';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createOrderUrl = import.meta.env.VITE_API_CREATE_ORDER;
const verifyPaymentUrl = import.meta.env.VITE_API_VERIFY_PAYMENT;

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const mapRef = useRef();
  const user = auth.currentUser;

  const [processingPayment, setProcessingPayment] = useState(false);

  if (processingPayment) {
    document.body.style.pointerEvents = 'none';
    document.body.style.opacity = '0.6';
  } else {
    document.body.style.pointerEvents = 'auto';
    document.body.style.opacity = '1';
  }

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [location, setLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [mapCenter, setMapCenter] = useState([12.2253, 79.0747]); // Default center: Tiruvannamalai, Tamil Nadu
  const [mapZoom, setMapZoom] = useState(13);
  const [mapType, setMapType] = useState('satellite'); // 'satellite' or 'street'

  // Custom marker icon
  const markerIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Reverse geocoding function
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();

      if (data?.address) {
        const addr = data.address;
        return {
          address: `${addr.road || ""} ${addr.house_number || ""} ${addr.neighbourhood || ""}`.trim(),
          city: addr.city || addr.town || addr.village || addr.county || "",
          state: addr.state || "",
          pincode: addr.postcode || "",
          country: addr.country || "India",
        };
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      throw new Error("Could not fetch location details.");
    }
  };

  // Update form data from location
  const updateFormFromLocation = async (lat, lng) => {
    try {
      const addressData = await reverseGeocode(lat, lng);
      setFormData(prev => ({
        ...prev,
        ...addressData
      }));
    } catch (error) {
      alert(error.message);
    }
  };

  // Auto-detect location using browser's Geolocation API
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLocation = { lat: latitude, lng: longitude };

        setLocation(newLocation);
        setMapCenter([latitude, longitude]);
        setMapZoom(16);

        try {
          await updateFormFromLocation(latitude, longitude);
        } catch (error) {
          // Error already handled in updateFormFromLocation
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        let errorMessage = "Location access failed.";

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please allow location access and try again.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        alert(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle manual pin drop
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    const newLocation = { lat, lng };

    setLocation(newLocation);
    setMapCenter([lat, lng]);

    try {
      await updateFormFromLocation(lat, lng);
    } catch (error) {
      // Error already handled in updateFormFromLocation
    }
  };

  // Map events component for handling clicks
  const MapEvents = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  // ----- Handle checkout -----
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location) {
      alert("Please set a delivery location.");
      return;
    }

    setProcessingPayment(true);

    try {
      if (paymentMethod === "cod") {
        // COD Order
        const orderRef = await addDoc(collection(db, "orders"), {
          userId: user?.uid,
          items: cartItems,
          amount: cartTotal,
          currency: "INR",
          status: "Pending (COD)", // COD orders start as pending
          paymentMethod: "COD",
          createdAt: serverTimestamp(),
          shipping: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: formData.country,
            location: location, // { lat, lng }
          },
        });

        clearCart();
        navigate("/orderconfirmation", {
          state: { orderId: orderRef.id, payment: "cod" },
        });

        setProcessingPayment(false);
        return;
      }

      // Online Payment (Card / UPI → Razorpay)
      const { data } = await axios.post(createOrderUrl, {
        amount: cartTotal,
        currency: "INR",
      });

      const { orderId, keyId, amount } = data;

      // Store initial order (status "Initiated")
      await addDoc(collection(db, "orders"), {
        userId: user?.uid,
        items: cartItems,
        amount: cartTotal,
        currency: "INR",
        status: "Initiated",
        paymentMethod,
        razorpayOrderId: orderId,
        createdAt: serverTimestamp(),
        shipping: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
          location: location,
        },
      });

      let paymentDescription = "";
      if (cartItems.length === 1) {
        paymentDescription = `Payment for ${cartItems[0].name}`;
      } else {
        paymentDescription = `Payment for ${cartItems[0].name} + ${cartItems.length - 1} more item(s)`;
      }

      const options = {
        key: keyId,
        amount,
        currency: "INR",
        name: "Fruit Bunch",
        description: paymentDescription,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(verifyPaymentUrl, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              await addDoc(collection(db, "payments"), {
                userId: user?.uid,
                orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                createdAt: serverTimestamp(),
              });

              clearCart();
              navigate("/orderconfirmation", {
                state: { orderId, payment: paymentMethod },
              });
            } else {
              alert("Payment verification failed!");
            }
          } catch (err) {
            console.error("Verify error:", err);
            alert("Verification failed.");
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#22c55e" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order error:", err);
      alert("Failed to place order.");
      setProcessingPayment(false);
    }
  };

  // If cart is empty, redirect to cart page
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-lg text-gray-600 mb-8">
            There's nothing to checkout. Add some items to your cart first.
          </p>
          <Link
            to="/cart"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  // Tile layers for different map types
  const tileLayers = {
    satellite: {
      url: "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
      attribution: '&copy; Google Satellite',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    },
    hybrid: {
      url: "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
      attribution: '&copy; Google Hybrid',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    },
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; OpenStreetMap contributors'
    },
    detailed: {
      url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      attribution: '&copy; OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team'
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center border-b border-gray-100 pb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />

                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-green-600 font-bold">₹{item.price} × {item.quantity}</p>
                  </div>

                  <div className="ml-4">
                    <p className="font-bold text-green-600">₹{item.price * item.quantity}</p>
                  </div>
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
          </div>
        </div>

        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Shipping Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs md:text-sm font-medium text-gray-700">Delivery Location</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={mapType}
                    onChange={(e) => setMapType(e.target.value)}
                    className="text-xs md:text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="satellite">Satellite</option>
                    <option value="street">Street</option>
                  </select>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={isLoadingLocation}
                    className="text-xs md:text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center"
                  >
                    {isLoadingLocation ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Detecting...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Use my location
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4 border rounded-lg overflow-hidden">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: "300px", width: "100%" }}
                  ref={mapRef}
                >
                  <TileLayer
                    attribution={tileLayers[mapType].attribution}
                    url={tileLayers[mapType].url}
                    subdomains={tileLayers[mapType].subdomains}
                  />
                  <MapEvents />
                  {location && (
                    <Marker position={[location.lat, location.lng]} icon={markerIcon}>
                      <Popup>
                        <div className="text-sm">
                          <strong>Delivery Location</strong>
                          <br />
                          {formData.address && `${formData.address}, `}
                          {formData.city && `${formData.city}, `}
                          {formData.state && `${formData.state} - `}
                          {formData.pincode}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                💡 Click on the map to set your delivery location manually
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  pattern="[0-9]{6}"
                  title="6-digit pincode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>

            <div className="mb-6 space-y-3">
              <div className="flex items-center">
                <input
                  id="card"
                  name="paymentMethod"
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                  Credit/Debit Card
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="upi"
                  name="paymentMethod"
                  type="radio"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="upi" className="ml-3 block text-sm font-medium text-gray-700">
                  UPI
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="cod"
                  name="paymentMethod"
                  type="radio"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                  Cash on Delivery
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link
                to="/cart"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition text-center"
              >
                Back to Cart
              </Link>
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Pay ₹{cartTotal}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;