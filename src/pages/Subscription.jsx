import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import BasePlanimage from '../assets/images/BasicPlanImage.jpeg';
import Premiumimage from '../assets/images/PeriumPlanImage.jpeg';
import diabeticplan from '../assets/images/fruit-7.jpg';
import balanceddiet from '../assets/images/BalancedDiet.png';
import saladplan from '../assets/images/juice2.jpg';
import kidsplan from '../assets/images/kidsplan.jpg';
import freshjuice from '../assets/images/freshjuice.jpg';
import buttermilk from '../assets/images/butter.jpg';
import greekyogurt from '../assets/images/yogurt.jpg';

const Subscription = () => {
  const { addToCart, cartItems } = useCart();
  const [expandedItems, setExpandedItems] = useState({});
  const navigate = useNavigate();

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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

  const subscriptionPlans = [
    {
      id: 1,
      name: "Basic plan",
      price: 2499,
      image: BasePlanimage,
      description: "Apple, Orange, Papaya, Pineapple",
      moreInfo: "Grapes, Guava, Water melon, Fig, Pears, chikku",
      type: "plan"
    },
    {
      id: 2,
      name: "Premium plan",
      price: 2999,
      image: Premiumimage,
      description: "Apple, Orange, Dragon fruits, Pineapple",
      moreInfo: "Grapes, Strawberry, Blueberry/cherry, Kiwi, Pears",
      type: "plan"
    },
    {
      id: 3,
      name: "Diabetic plan",
      price: 2499,
      image: diabeticplan,
      description: "Amla, Guava, Kiwi, Fig",
      moreInfo: "Grapes, Pineapple, Kiwi, Orange",
      type: "plan"
    },
    {
      id: 4,
      name: "Balanced Diet platter",
      price: 3499,
      image: balanceddiet,
      description: "2 Fruit, 2 Vegetables, Dry Fruit",
      moreInfo: "Nuts, Sprouts, Steamed Vegetables",
      type: "plan"
    },
    {
      id: 5,
      name: "Salad Bowl",
      price: 2499,
      image: saladplan,
      description: "Nutrients, Quality Proteins, Good fat",
      moreInfo: "Healthy, Probiotic, Whole carb, antioxidants",
      type: "plan"
    },
    {
      id: 6,
      name: "Kids fruit bowl",
      price: 1199,
      image: kidsplan,
      description: "Corn, Cucumber, Nuts",
      moreInfo: "Grapes, Strawberry, Blueberry/cherry, Kiwi, Pears",
      type: "plan"
    }
  ];

  const drinks = [
    {
      id: 7,
      name: "Fresh Juice",
      price: 699,
      image: freshjuice,
      type: "drink"
    },
    {
      id: 8,
      name: "Butter milk",
      price: 599,
      image: buttermilk,
      type: "drink"
    },
    {
      id: 9,
      name: "Greek Yogurt",
      price: 40,
      image: greekyogurt,
      type: "drink",
      isDaily: true
    }
  ];

  const hasActivePlan = cartItems.some(item => item.type === "plan");

  const handleAddToCart = (product) => {
    if (product.type === "drink" && !hasActivePlan) {
      alert("Please subscribe to a plan before adding drinks!");
      return;
    }
    addToCart(product);
    navigate('/cart')
  };

  const handleSubscribe = (product) => {
    if (product.type === "drink" && !hasActivePlan) {
      alert("Please subscribe to a plan before adding drinks!");
      return;
    }
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-10 py-12 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 -right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-40 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-12" data-aos="fade-up">Choose Your Subscription</h1>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {subscriptionPlans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition" data-aos="fade-up">
            <img src={plan.image} alt={plan.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-green-800 mb-2">{plan.name}</h3>
              <p className="text-2xl font-bold text-green-600 mb-4">₹{plan.price}/- per month</p>
              <p className="text-gray-600 mb-3 text-sm">
                {plan.description.length > 20 ? plan.description.slice(0, 20) + '...' : plan.description}
                <button
                  onClick={() => toggleExpand(plan.id)}
                  className="ml-2 text-green-600 hover:text-green-800 font-semibold"
                >
                  {expandedItems[plan.id] ? 'Less' : 'More'}
                </button>
              </p>
              {expandedItems[plan.id] && (
                <p className="text-gray-600 mb-4">{plan.moreInfo}</p>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAddToCart(plan)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition"
                >
                  Add to Cart
                </button>
                <button onClick={() => handleSubscribe(plan)} className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add-on Drinks */}
      <div className="mb-16">
        {/* Animated background elements */}
        <div className="absolute -top-200 -left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-640 -right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-8" data-aos="fade-up">Add On Drinks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {drinks.map(drink => (
            <div key={drink.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition" data-aos="fade-up">
              <img src={drink.image} alt={drink.name} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-green-800 mb-2">{drink.name}</h3>
                <p className="text-lg lg:text-2xl font-bold text-green-600 mb-4">
                  ₹{drink.price}/- {drink.isDaily ? 'per day' : 'per month'}
                </p>
                <div className="flex lg:space-x-3 md:flex-col lg:flex-row gap-3">
                  <button
                    onClick={() => handleAddToCart(drink)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition"
                  >
                    Add to Cart
                  </button>
                  <button onClick={() => handleSubscribe(drink)} className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded transition">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;