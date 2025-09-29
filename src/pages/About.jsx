import React from 'react';
import { Link } from 'react-router-dom';
import aboutImage from '/src/assets/images/about-3.jpg';
import aboutBackImg from '/src/assets/images/aboutbackimgg.jpg';

const About = () => {
  return (
    <div className="container mx-auto px-10 py-12">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-20">
        <div className="lg:w-1/2 order-2 lg:order-1">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Nourishing Lives Through <span className="text-green-600">Wholesome Eating</span>
          </h1>
          <div className="space-y-4 mb-8">
            <p className="text-lg text-gray-600 leading-relaxed">
              At Fruit Bunch, we specialize in crafting healthy, ready-to-eat meals packed with essential nutrients to fuel your body and mind.
            </p>
            <p className="text-lg font-semibold text-gray-700">
              Our offerings include:
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center bg-green-50 rounded-lg p-3">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-gray-700">Fruit Bowls</span>
              </div>
              <div className="flex items-center bg-green-50 rounded-lg p-3">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-gray-700">Diet Platters</span>
              </div>
              <div className="flex items-center bg-green-50 rounded-lg p-3">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-gray-700">Salad Bowls</span>
              </div>
              <div className="flex items-center bg-green-50 rounded-lg p-3">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-gray-700">Fresh Juices</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Our Goal is Simple</h2>
            <p className="text-lg text-gray-700">To make healthy eating</p>
            <p className="text-2xl font-bold text-green-700 mt-1">Easy, Affordable and Delicious!</p>
          </div>
        </div>

        <div className="lg:w-1/2 order-1 lg:order-2">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl w-full max-w-xl aspect-[4/4]">
            <img
              src={aboutImage}
              alt="About Fruit Bunch"
              className="w-full h-full object-cover rounded-2xl transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-3xl p-10 shadow-lg mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Our Philosophy</h2>
          <div className="text-2xl text-green-700 font-semibold mb-8">
            EAT FRESH. STAY HEALTHY. LIVE BETTER!
          </div>
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              At Fruit Bunch, we believe in the transformative power of healthy eating. Our mission is to provide
              nutrient-rich, well-balanced meals that fuel your body and mind for optimal performance.
            </p>
            <p>
              We meticulously source the freshest ingredients and craft them into wholesome platters, salads,
              and drinks that cater to a healthy and active lifestyle. Each item on our menu is designed to
              deliver maximum nutritional value without compromising on taste.
            </p>
            <p>
              Whether you're looking for a balanced diet, nutritious salad bowl, or refreshing add-ons, our
              carefully curated menu ensures you get the perfect combination of taste, health, and convenience.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-14">What Drives Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.5 1.5 0 013 15.546V5a2 2 0 012-2h14a2 2 0 012 2v10.546z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v4l2 2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Quality & Freshness</h3>
            <p className="text-gray-600">
              We source only the freshest, highest-quality ingredients for all our products, ensuring
              maximum nutritional value and taste.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Community Health</h3>
            <p className="text-gray-600">
              We're committed to improving community health by making nutritious eating accessible,
              affordable, and enjoyable for everyone.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Sustainability</h3>
            <p className="text-gray-600">
              We prioritize environmentally responsible practices, from sourcing to packaging, to
              minimize our ecological footprint.
            </p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Visit Us</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Come experience the freshness at our location. We'd love to welcome you!
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3899.0586626904005!2d79.0956933!3d12.244307300000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bacc17e8a517c7f%3A0xc7eb43ae80e2cef2!2sFRUIT%20BUNCH!5e0!3m2!1sen!2sin!4v1758553288639!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Fruit Bunch Location"
            className="rounded-2xl"
          ></iframe>
        </div>

        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Store Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <div>
                <p className="font-medium text-gray-700">Address</p>
                <p className="text-gray-600">No:59, sarathambal nagar, Tiruvannamalai, Tamil Nadu 606601</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="font-medium text-gray-700">Opening Hours</p>
                <p className="text-gray-600">Mon-Sat: 7:30 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative rounded-2xl overflow-hidden shadow-xl mb-16">
        <img
          src={aboutBackImg}
          alt="Fresh fruits background"
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center p-6 max-w-3xl">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Fresh. Healthy. Delivered.
            </h3>
            <p className="text-xl text-white mb-8 opacity-90">
              Experience the difference that fresh, nutrient-packed meals can make in your life.
            </p>
            <Link to="/subscription" className="bg-white text-green-700 font-semibold py-3 px-8 rounded-xl hover:bg-green-50 transition-colors duration-300 shadow-lg">
              Explore Our Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 shadow-lg">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Freshness Delivered To Your Door
          </h2>
          <p className="text-gray-600 mb-6">
            Enjoy seasonal fruits, health tips, and exclusive offers — straight from our farm to your family.
          </p>
          <Link
            to="/subscription"
            className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 inline-block"
          >
            Start Your Subscription
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;