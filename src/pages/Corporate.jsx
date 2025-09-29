import React, { useState, useEffect } from 'react';
import bulk1 from "../assets/images/bulk1.jpeg";
import bulk2 from "../assets/images/bulk2.jpeg";
import bulk3 from "../assets/images/bulk3.jpeg";
import primeplan from "../assets/images/primeplan.jpg";
import homeplan from "../assets/images/homeplan.jpg";
import BasePlanimage from '../assets/images/basicplan.jpg';
import Premiumimage from '../assets/images/primeplan.jpg';
import diabeticplan from '../assets/images/fruit-7.jpg';
import { db } from '../../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Corporate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [currentImage, setCurrentImage] = useState(0);

  // Hero images
  const heroImages = [bulk1, bulk2, bulk3];

  // Hero image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await addDoc(collection(db, "corporateQuotes"), {
          ...formData,
          createdAt: Timestamp.now()
        });
        alert("Thank you! Your request has been submitted.");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
      }
    }
  };

  const sendMessage = () => {
    const phonenumber = "918807239379";
    const message = "I'm interested in corporate orders for Fruit Bunch";
    const encodeMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phonenumber}?text=${encodeMessage}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto px-10 py-12 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 -right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[750px] -left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-[1400px] -right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[2100px] -left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-[2100px] -right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center mb-20 gap-10">
        <div className="lg:w-1/2">
          <div className="relative rounded-2xl overflow-hidden shadow transform transition-all duration-500 hover:shadow-xl w-full max-w-xl aspect-[4/4]">
            {heroImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="Corporate Orders"
                className={`absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-1000 ease-in-out ${currentImage === index ? "opacity-100" : "opacity-0"
                  }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
          </div>
        </div>

        <div className="lg:w-1/2">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
            Elevate Workplace Wellness with{" "}
            <span className="text-green-600">Fresh Fruit Delivery</span>
          </h1>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-start">
              <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <p className="text-sm lg:text-lg text-gray-600">
                Combat afternoon slumps with natural energy boosts
              </p>
            </div>

            <div className="flex items-center justify-start">
              <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <p className="text-sm lg:text-lg text-gray-600">
                Reduce sick days with immune-boosting nutrition
              </p>
            </div>

            <div className="flex items-center justify-start">
              <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <p className="text-sm lg:text-lg text-gray-600">
                Increase productivity with healthier, happier teams
              </p>
            </div>
          </div>

          <div className="mb-8 p-6 bg-green-50 rounded-2xl border-l-4 border-green-500">
            <h2 className="text-lg lg:text-xl font-semibold text-green-800 mb-2">
              Ready to transform your workplace?
            </h2>
            <p className="text-lg lg:text-xl font-medium text-gray-700">Call us: +918807239379</p>
          </div>

          <button
            onClick={sendMessage}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-md transform hover:-translate-y-1 flex items-center justify-center"
          >
            <svg
              className="w-6 h-6 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.864 3.49" />
            </svg>
            Message us on WhatsApp
          </button>
        </div>
      </section>

      {/* Popular Corporate Orders */}
      <section className="mb-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">Corporate Wellness Plans</h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">Tailored fruit delivery programs designed to boost employee health and productivity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
            <div className="relative overflow-hidden h-64">
              <img
                src={BasePlanimage}
                alt="Basic Plan"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute top-4 right-4 bg-green-500 text-white py-1 px-3 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Essential Wellness</h3>
              <p className="text-gray-600 mb-4 text-sm lg:text-lg">Perfect for small teams looking to incorporate healthy habits</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-xs lg:text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>3 fruit varieties daily</span>
                </li>
                <li className="flex items-center text-xs lg:text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Weekly delivery</span>
                </li>
                <li className="flex items-center text-xs lg:text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Seasonal selections</span>
                </li>
              </ul>
              <button onClick={() => navigate("/subscription")} className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-3 rounded-lg transition-colors duration-300">
                View Plan
              </button>
            </div>
          </div>

          {/* Plan 2 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
            <div className="relative overflow-hidden h-64">
              <img
                src={Premiumimage}
                alt="Premium Plan"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Premium Refresh</h3>
              <p className="text-gray-600 mb-4 text-sm lg:text-lg">Comprehensive nutrition for medium to large organizations</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-xs lg:text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>5+ premium fruit varieties</span>
                </li>
                <li className="flex items-center text-xs lg:text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Twice weekly delivery</span>
                </li>
                <li className="flex items-center text-xs lg:text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Organic options available</span>
                </li>
              </ul>
              <button onClick={() => navigate("/subscription")} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300">
                View Plan
              </button>
            </div>
          </div>

          {/* Plan 3 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
            <div className="relative overflow-hidden h-64">
              <img
                src={diabeticplan}
                alt="Diet Plan"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Executive Wellness</h3>
              <p className="text-gray-600 mb-4 text-sm lg:text-lg">Premium customized programs for health-conscious organizations</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-xs lg:text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Customized fruit selection</span>
                </li>
                <li className="flex items-center text-xs lg:text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Daily delivery options</span>
                </li>
                <li className="flex items-center text-xs lg:text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Nutritionist consultation included</span>
                </li>
              </ul>
              <button onClick={() => navigate("/subscription")} className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-3 rounded-lg transition-colors duration-300">
                View Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-20 bg-gradient-to-r from-green-50 to-emerald-50 py-14 px-4 rounded-3xl">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">Why Companies Choose Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">92%</div>
              <p className="text-gray-600 text-xs lg:text-sm">Employee satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">350+</div>
              <p className="text-gray-600 text-xs lg:text-sm">Corporate clients</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">10h</div>
              <p className="text-gray-600 text-xs lg:text-sm">Delivery time</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <p className="text-gray-600 text-xs lg:text-sm">Organic guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-white rounded-3xl p-8 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Get Your Custom Quote</h2>
            <p className="text-xl text-gray-600">Tell us about your company's needs and we'll prepare a tailored proposal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-5 py-4 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition`}
                  required
                />
                {formErrors.name && <p className="mt-2 text-red-500 text-sm">{formErrors.name}</p>}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Work Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-5 py-4 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition`}
                  required
                />
                {formErrors.email && <p className="mt-2 text-red-500 text-sm">{formErrors.email}</p>}
              </div>
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-5 py-4 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition`}
                required
              />
              {formErrors.phone && <p className="mt-2 text-red-500 text-sm">{formErrors.phone}</p>}
            </div>

            <div>
              <textarea
                name="message"
                placeholder="Tell us about your company size and fruit preferences..."
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className={`w-full px-5 py-4 border ${formErrors.message ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition`}
                required
              ></textarea>
              {formErrors.message && <p className="mt-2 text-red-500 text-sm">{formErrors.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-md"
            >
              Request Custom Proposal
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Corporate;