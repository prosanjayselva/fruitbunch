import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'accounts', title: 'User Accounts' },
    { id: 'subscriptions', title: 'Subscriptions' },
    { id: 'payments', title: 'Payments' },
    { id: 'delivery', title: 'Delivery Policy' },
    { id: 'cancellations', title: 'Cancellations & Refunds' },
    // { id: 'conduct', title: 'User Conduct' },
    // { id: 'intellectual', title: 'Intellectual Property' },
    // { id: 'liability', title: 'Liability' },
    // { id: 'changes', title: 'Changes to Terms' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg sticky top-8 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${activeSection === section.id
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    {section.title}
                  </button>
                ))}
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 text-sm mb-2">Questions?</h4>
                  <p className="text-green-700 text-xs">
                    Contact our privacy team at{' '}
                    <p className='font-medium text-lg'>Hariharan</p>
                    <a href="mailto:fruitbunch.tvm@gmail.com" className="underline">
                      fruitbunch.tvm@gmail.com
                    </a><br />or call us at{' '}
                    <a href="tel:+918807239379" className="underline">
                      +91 88072 39379
                    </a>
                  </p>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Introduction */}
              {activeSection === 'introduction' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introduction</h2>
                  <div className="prose prose-lg text-gray-700 space-y-4">
                    <p>
                      Welcome to <strong>FreshDaily</strong> ("we," "our," or "us"). These Terms and Conditions
                      govern your use of our subscription-based daily delivery service. By accessing or using
                      our services, you agree to be bound by these terms.
                    </p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                      <p className="text-blue-800 font-medium">Important:</p>
                      <p className="text-blue-700 text-sm mt-1">
                        Please read these terms carefully before using our services. If you disagree with any part
                        of these terms, you may not access our services.
                      </p>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">1.1 Definitions</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Service:</strong> Our daily delivery subscription service</li>
                      <li><strong>User:</strong> Any individual or entity using our services</li>
                      <li><strong>Subscription:</strong> A recurring service plan with specified duration</li>
                      <li><strong>Content:</strong> All materials provided through our service</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* User Accounts */}
              {activeSection === 'accounts' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">2. User Accounts</h2>
                  <div className="prose prose-lg text-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">2.1 Account Registration</h3>
                    <p>
                      To use our services, you must register for an account by providing accurate and complete
                      information. You are responsible for maintaining the confidentiality of your account
                      credentials.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900">2.2 Account Security</h3>
                    <p>
                      You must notify us immediately of any unauthorized use of your account. We reserve the
                      right to suspend or terminate accounts that violate these terms.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900">2.3 Age Requirement</h3>
                    <p>
                      You must be at least 18 years old to use our services. By registering, you represent
                      that you meet this age requirement.
                    </p>
                  </div>
                </div>
              )}

              {/* Subscriptions */}
              {activeSection === 'subscriptions' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Subscriptions</h2>
                  <div className="prose prose-lg text-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">3.1 Subscription Plans</h3>
                    <p>
                      We offer various subscription plans with different durations and features. All
                      subscriptions automatically renew unless canceled before the renewal date.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900">3.2 Subscription Period</h3>
                    <p>
                      Each subscription period is 26 days. The service will automatically renew for subsequent
                      26-day periods unless canceled.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900">3.3 Cancellation Policy</h3>
                    <p>
                      You may cancel your subscription at any time. Cancellations will take effect at the end
                      of the current billing period.
                    </p>

                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
                      <p className="text-yellow-800 font-medium">Note:</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        Canceling your subscription does not entitle you to a refund for the current period.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payments */}
              {activeSection === 'payments' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Payments</h2>
                  <div className="prose prose-lg text-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">4.1 Payment Methods</h3>
                    <p>
                      We accept various payment methods including credit/debit cards, UPI, and other
                      electronic payment systems. All payments are processed through secure third-party
                      payment gateways.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900">4.2 Billing Cycle</h3>
                    <p>
                      Payments are charged at the beginning of each subscription period. You will receive
                      a notification before each renewal.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900">4.3 Price Changes</h3>
                    <p>
                      We reserve the right to change subscription prices. Existing subscribers will be
                      notified 30 days in advance of any price changes.
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery Policy */}
              {activeSection === 'delivery' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Delivery Policy</h2>
                  <div className="prose prose-lg text-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">5.1 Delivery Areas</h3>
                    <p>
                      We currently deliver to specified areas within our service coverage. Delivery
                      availability may vary based on your location.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900">5.2 Delivery Times</h3>
                    <p>
                      Deliveries are made daily within specified time windows. While we strive for
                      punctuality, delivery times may vary due to unforeseen circumstances.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900">5.3 Delivery Issues</h3>
                    <p>
                      If you encounter any delivery issues, please contact our support team within
                      24 hours of the scheduled delivery time.
                    </p>
                  </div>
                </div>
              )}

              {/* Cancellations & Refunds */}
              {activeSection === 'cancellations' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Cancellations & Refunds</h2>
                  <div className="prose prose-lg text-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">6.1 Subscription Cancellation</h3>
                    <p>
                      You may cancel your subscription at any time through your account dashboard.
                      The cancellation will take effect at the end of your current billing period.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900">6.2 Refund Policy</h3>
                    <p>
                      We offer refunds only under specific circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Service interruption for more than 3 consecutive days</li>
                      <li>Technical issues preventing service access</li>
                      <li>Duplicate payments</li>
                    </ul>

                    <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
                      <p className="text-red-800 font-medium">No Refunds For:</p>
                      <ul className="text-red-700 text-sm mt-1 list-disc list-inside ml-4">
                        <li>Change of mind after subscription</li>
                        <li>Non-usage of service during active period</li>
                        <li>Partial month usage</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Add more sections following the same pattern */}

              {/* Quick Navigation */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex > 0) setActiveSection(sections[currentIndex - 1].id);
                    }}
                    className="flex items-center text-green-600 hover:text-green-700"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous Section
                  </button>

                  <button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex < sections.length - 1) setActiveSection(sections[currentIndex + 1].id);
                    }}
                    className="flex items-center text-green-600 hover:text-green-700"
                  >
                    Next Section
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Acceptance Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceptance of Terms</h3>
                <p className="text-gray-600 mb-4">
                  By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
                <div className="flex justify-center space-x-4">
                  {/* <Link
                    to="/contact"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Contact Support
                  </Link> */}
                  <Link
                    to="/privacypolicy"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;