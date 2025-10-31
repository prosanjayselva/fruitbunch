import React, { useState, useEffect } from "react";
import OfferBannerimage from '../assets/images/Offerbanner.jpg';

const OfferBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const now = new Date();
    const isOfferPeriod =
      now.getFullYear() === 2025 && (
        (now.getMonth() === 9) || // October (pre-offer promo)
        (now.getMonth() === 10 && now.getDate() <= 15) // November 1–15
      );

    if (isOfferPeriod) {
      setShowBanner(true);
    }
  }, []);

  const handleClose = () => {
    setShowBanner(false);
    // localStorage.setItem("offerBannerClosed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999] px-4">
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 bg-white/70 hover:bg-white text-gray-700 font-bold rounded-full w-8 h-8 flex items-center justify-center transition"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Banner Image */}
        <img
          src={OfferBannerimage}
          alt="November Offer"
          className="w-full h-auto object-cover"
        />

        {/* Optional Footer Message */}
        {/* <div className="p-4 bg-white text-center">
          <h2 className="text-lg font-semibold text-emerald-700">
            November Festive Offer!
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            10% OFF on Card/UPI & 5% OFF on COD — valid until <b>Nov 15</b>.
          </p>
          <button
            onClick={handleClose}
            className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Got it
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default OfferBanner;