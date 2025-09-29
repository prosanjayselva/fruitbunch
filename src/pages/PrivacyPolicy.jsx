import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'information', title: 'Information We Collect' },
    { id: 'usage', title: 'How We Use Information' },
    { id: 'sharing', title: 'Information Sharing' },
    { id: 'cookies', title: 'Cookies & Tracking' },
    // { id: 'security', title: 'Data Security' },
    // { id: 'rights', title: 'Your Rights' },
    // { id: 'retention', title: 'Data Retention' },
    // { id: 'children', title: "Children's Privacy" },
    // { id: 'changes', title: 'Policy Changes' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We are committed to protecting your privacy and ensuring transparency about how we handle your personal information.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg sticky top-8 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Navigation</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>

              {/* Quick Contact */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">Questions?</h4>
                <p className="text-blue-700 text-xs">
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
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Overview */}
              {activeSection === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Overview</h2>
                  <div className="prose prose-lg text-gray-700 space-y-4">
                    <p>
                      At <strong>FreshDaily</strong>, we are committed to protecting your privacy and ensuring 
                      the security of your personal information. This Privacy Policy explains how we collect, 
                      use, disclose, and safeguard your information when you use our services.
                    </p>

                    <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
                      <p className="text-green-800 font-medium">Our Commitment:</p>
                      <ul className="text-green-700 text-sm mt-1 list-disc list-inside ml-4">
                        <li>We never sell your personal information</li>
                        <li>We minimize data collection to what's necessary</li>
                        <li>We implement robust security measures</li>
                        <li>We are transparent about our practices</li>
                      </ul>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">1.1 Scope</h3>
                    <p>
                      This policy applies to all information collected through our website, mobile applications, 
                      and services (collectively, the "Services").
                    </p>
                  </div>
                </div>
              )}

              {/* Information We Collect */}
              {activeSection === 'information' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
                  <div className="prose prose-lg text-gray-700 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">2.1 Personal Information</h3>
                    <p>We collect information that identifies you as an individual:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Contact Information:</strong> Name, email address, phone number</li>
                      <li><strong>Account Information:</strong> Username, password, profile details</li>
                      <li><strong>Payment Information:</strong> Billing address, payment method details</li>
                      <li><strong>Delivery Information:</strong> Shipping address, location data</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900">2.2 Usage Information</h3>
                    <p>We automatically collect information about your interaction with our Services:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and time spent</li>
                      <li>Subscription usage patterns</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900">2.3 Location Information</h3>
                    <p>
                      With your permission, we collect precise location data to provide delivery services 
                      and improve user experience.
                    </p>
                  </div>
                </div>
              )}

              {/* How We Use Information */}
              {activeSection === 'usage' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">3. How We Use Your Information</h2>
                  <div className="prose prose-lg text-gray-700 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Service Provision</h4>
                        <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside ml-2">
                          <li>Process subscriptions and payments</li>
                          <li>Schedule and manage deliveries</li>
                          <li>Provide customer support</li>
                          <li>Send service notifications</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Service Improvement</h4>
                        <ul className="text-green-700 text-sm space-y-1 list-disc list-inside ml-2">
                          <li>Analyze usage patterns</li>
                          <li>Improve service quality</li>
                          <li>Develop new features</li>
                          <li>Personalize user experience</li>
                        </ul>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">3.1 Legal Bases for Processing</h3>
                    <p>We process your information based on:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Contractual necessity:</strong> To provide the services you requested</li>
                      <li><strong>Legal compliance:</strong> To meet regulatory requirements</li>
                      <li><strong>Legitimate interests:</strong> To improve our services</li>
                      <li><strong>Consent:</strong> For specific purposes where required</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Information Sharing */}
              {activeSection === 'sharing' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Information Sharing & Disclosure</h2>
                  <div className="prose prose-lg text-gray-700 space-y-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                      <p className="text-yellow-800 font-medium">We do not sell your personal information to third parties.</p>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">4.1 Service Providers</h3>
                    <p>We share information with trusted service providers who assist in our operations:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Payment processors (Razorpay, Stripe)</li>
                      <li>Delivery and logistics partners</li>
                      <li>Cloud storage providers (Firebase)</li>
                      <li>Customer support platforms</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900">4.2 Legal Requirements</h3>
                    <p>We may disclose information when required by law or to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Comply with legal processes</li>
                      <li>Protect our rights and property</li>
                      <li>Prevent fraud or security issues</li>
                      <li>Protect the safety of our users</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Cookies */}
              {activeSection === 'cookies' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Cookies & Tracking Technologies</h2>
                  <div className="prose prose-lg text-gray-700 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">5.1 Types of Cookies We Use</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Essential</td>
                            <td className="px-4 py-3 text-sm text-gray-700">Basic website functionality</td>
                            <td className="px-4 py-3 text-sm text-gray-700">Session</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Analytics</td>
                            <td className="px-4 py-3 text-sm text-gray-700">Service improvement</td>
                            <td className="px-4 py-3 text-sm text-gray-700">2 years</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Preferences</td>
                            <td className="px-4 py-3 text-sm text-gray-700">Remember your settings</td>
                            <td className="px-4 py-3 text-sm text-gray-700">1 year</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">5.2 Managing Cookies</h3>
                    <p>
                      You can control cookie settings through your browser. However, disabling essential 
                      cookies may affect service functionality.
                    </p>
                  </div>
                </div>
              )}

              {/* Add remaining sections following the same pattern */}

              {/* Your Rights */}
              {activeSection === 'rights' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Your Privacy Rights</h2>
                  <div className="prose prose-lg text-gray-700 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Access & Portability</h4>
                        <p className="text-sm text-gray-600">
                          Request a copy of your personal data in a machine-readable format
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Correction</h4>
                        <p className="text-sm text-gray-600">
                          Update or correct inaccurate personal information
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Deletion</h4>
                        <p className="text-sm text-gray-600">
                          Request deletion of your personal data under certain conditions
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Objection</h4>
                        <p className="text-sm text-gray-600">
                          Object to processing of your personal data for specific purposes
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">7.1 Exercising Your Rights</h3>
                    <p>
                      To exercise any of these rights, please contact us at{' '}
                      <a href="mailto:privacy@freshdaily.com" className="text-blue-600 underline">
                        privacy@freshdaily.com
                      </a>
                      . We will respond to your request within 30 days.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex > 0) setActiveSection(sections[currentIndex - 1].id);
                    }}
                    className="flex items-center text-blue-600 hover:text-blue-700"
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
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    Next Section
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Our Privacy Team</h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us.
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="mailto:fruitbunch.tvm@gmail.com"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Email Privacy Team
                  </a>
                  <Link
                    to="/termsandconditions"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition"
                  >
                    View Terms
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

export default PrivacyPolicy;