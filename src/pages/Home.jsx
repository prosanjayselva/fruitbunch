import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import home1 from "../assets/images/home-1.png";
import home2 from "../assets/images/home-2.png";
import backbowl1 from "../assets/images/backbowl1.png";
import sixfruit from "../assets/images/sixfruit.jpg";
import homeplan from "../assets/images/homeplan.jpg";

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);

  // Hero images
  const heroImages = [home2, home1, backbowl1];

  // Hero image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Initialize AOS
  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({
        duration: 800,
        easing: "ease-in-out",
        once: true
      });
    }
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-green-100 py-12 px-5 md:py-20 md:px-10 relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
          <div className="md:w-1/2 mb-8 md:mb-0 mr-4">
            <h1
              className="text-3xl lg:text-5xl font-bold text-gray-800 mb-6"
              data-aos="fade-up"
            >
              Fresh Fruit. No Fuss. Just Bunches of Goodness.
            </h1>
            <p
              className="text-base lg:text-lg text-gray-600 mb-8"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Fruit Bunch delivers clean, ready-to-eat fruit bowls straight to
              your doorstep. It's the simple, tasty, and healthy choice—every
              single day. Subscribe now and stay fresh, always.
            </p>
            <Link
              to="/subscription"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              Enjoy fresh cut fruit daily
            </Link>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <div
              className="relative w-full max-w-md h-[200px] md:h-[280px] lg:h-[400px] overflow-hidden rounded-lg shadow-xl"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              {heroImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="Fresh fruits"
                  className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    currentImage === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}

              {/* Floating badge */}
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md text-sm sm:text-base animate-bounce">
                <span className="text-green-600 font-bold">🍎 Fresh!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-5 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:px-10">
            <div
              className="md:w-1/2 mb-8 md:mb-0"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <div className="relative">
                <img
                  src={sixfruit}
                  alt="Variety of fruits"
                  className="w-full max-w-md rounded-lg shadow-md mx-auto transform transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md text-sm sm:text-base">
                  <span className="font-bold">6 Fruits Daily!</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  {
                    title: "Tropical Refresh: Summer Care Fruit Pack",
                    desc: "Cool down with this hydrating mix of nature's most refreshing fruits, perfect for beating the summer heat.",
                    icon: "🥥"
                  },
                  {
                    title: "Shield Boost: Immuno Care Fruit Pack",
                    desc: "Strengthen your body's natural defenses with this immunity-boosting blend, rich in vitamin C and antioxidants.",
                    icon: "🛡️"
                  },
                  {
                    title: "Nurture Nest: Mother Care Fresh Fruit Pack",
                    desc: "Carefully selected to support maternal health, rich in iron, folate, and essential nutrients.",
                    icon: "👩"
                  },
                  {
                    title: "Glow Mix: Skin & Hair Care Pack",
                    desc: "Let your beauty shine from within with this antioxidant-rich blend for clear skin and healthy hair.",
                    icon: "✨"
                  }
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="bg-green-50 p-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-green-100 transform hover:-translate-y-1"
                    data-aos="fade-up"
                    data-aos-delay={index * 200}
                  >
                    <div className="flex items-center mb-3">
                      {/* <span className="text-2xl mr-3">{benefit.icon}</span> */}
                      <h3 className="font-bold text-sm lg:text-xl text-green-800">
                        {benefit.title}
                      </h3>
                    </div>
                    <p className="text-xs lg:text-lg text-gray-600">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Seller Section */}
      <section className="py-16 px-5 md:px-10 bg-green-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-12"
            data-aos="fade-up"
          >
            Best Seller
          </h2>

          <div
            className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl"
            data-aos="zoom-in"
          >
            <div className="md:w-1/2 p-6 sm:p-8">
              <h3
                className="text-xl sm:text-2xl font-bold text-green-700 mb-4"
                data-aos="fade-right"
              >
                6 Days Six Different Variety of Diet Platter
              </h3>
              <ul className="space-y-3 mb-6">
                {[
                  "Amla 5pcs. Steamed broccoli 150gm Corn+Carrot & Cucumber, Sprouts, Dates + Nuts.",
                  "Papaya, Pineapple, Steamed Zucchini 150g + Green Peas (Bell Pepper Onion +Tomato + Sweet corn), Salad Sprouts, Nuts + Seeds.",
                  "Dragon fruit Apple, Steamed cabbage & beans 150g + Black eyed bean + Beetroot + Carrot, Sprouts Dates Seeds."
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start transition-transform duration-300 hover:translate-x-2"
                    data-aos="fade-up"
                    data-aos-delay={index * 150}
                  >
                    <span className="text-green-500 mr-2">•</span>
                    <span className="text-sm lg:text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/subscription"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 md:px-4 md:py-2 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                data-aos="zoom-in"
              >
                View All Plans
              </Link>
            </div>
            <div
              className="md:w-1/2"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <div className="bg-green-100 p-8 text-center h-full flex flex-col justify-center">
                <div className="relative inline-block">
                  <img
                    src={homeplan}
                    alt="Balanced Diet Platter"
                    className="w-full max-w-xs mx-auto rounded-lg mb-4 transform transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Popular!
                  </div>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">
                  BALANCED DIET PLATTER
                </h4>
                <p className="text-xl sm:text-2xl font-bold text-green-700 mb-2">
                  ₹3,499/- per month
                </p>
                <p className="text-gray-600 mb-4">Free delivery</p>
                <div className="flex justify-center items-center text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <Link
                  to="/subscription"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                  data-aos="zoom-in"
                  data-aos-delay="200"
                >
                  Subscribe Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;