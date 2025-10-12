import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const CorporateQuotesPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showModal, setShowModal] = useState(false);


  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const quotesQuery = query(collection(db, "corporateQuotes"), orderBy("createdAt", "desc"));
      const quotesSnapshot = await getDocs(quotesQuery);
      const quotesData = quotesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      setQuotes(quotesData);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (quote) => {
    setSelectedQuote(quote);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      New: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'New' },
      Contacted: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Contacted' },
      'In Progress': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'In Progress' },
      Completed: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
      Rejected: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status || 'New' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleDeleteQuote = async (quoteId) => {
    if (window.confirm('Are you sure you want to delete this quote request?')) {
      try {
        await deleteDoc(doc(db, 'corporateQuotes', quoteId));
        setQuotes(prev => prev.filter(quote => quote.id !== quoteId));
      } catch (error) {
        console.error('Error deleting quote:', error);
        alert('Error deleting quote request');
      }
    }
  };

  const handleStatusUpdate = async (quoteId, newStatus) => {
    try {
      const quoteRef = doc(db, 'corporateQuotes', quoteId);
      await updateDoc(quoteRef, { status: newStatus });
      setQuotes(prev => prev.map(quote =>
        quote.id === quoteId ? { ...quote, status: newStatus } : quote
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Apply filters and search
  const filteredQuotes = quotes.filter(quote => {
    const statusMatch = filterStatus === "All" || (quote.status || 'New') === filterStatus;
    const searchMatch =
      quote.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.phone?.includes(searchTerm) ||
      quote.message?.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && (searchTerm === '' || searchMatch);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-3 text-emerald-700 font-medium">Loading quote requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 lg:px-6 py-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Function Quote Requests</h2>
            <p className="text-emerald-700 text-sm">Manage all function quote inquiries</p>
          </div>
          <div className="text-xl lg:text-2xl text-emerald-600">
            <i className="fas fa-building"></i> {filteredQuotes.length}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, email, phone, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-10"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact Info</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Message</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 lg:px-6 py-8 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center">
                    <i className="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
                    <p>No quote requests found.</p>
                    {searchTerm && (
                      <p className="text-xs mt-1">Try adjusting your search criteria</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-xs lg:text-sm font-semibold text-gray-900">{quote.name}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-xs lg:text-sm">
                      <div className="text-gray-900 font-medium">{quote.email}</div>
                      <div className="text-gray-500">{quote.phone}</div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-xs lg:text-sm text-gray-700 max-w-xs">
                      {quote.message ? (
                        <div className="line-clamp-2" title={quote.message}>
                          {quote.message}
                        </div>
                      ) : (
                        <span className="text-gray-400">No message</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                    {quote.createdAt.toLocaleDateString()} <br />
                    <span className="text-gray-400">{quote.createdAt.toLocaleTimeString()}</span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm flex flex-row-reverse gap-1">
                    <select
                      value={quote.status || 'New'}
                      onChange={(e) => handleStatusUpdate(quote.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <div className="mt-1">
                      {getStatusBadge(quote.status || 'New')}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(quote)}
                        className="px-2 py-1 text-white rounded-lg transition text-xs"
                        title="View Details"
                      >
                        <i className="fas fa-eye mr-1 text-emerald-600 hover:text-emerald-700"></i>
                      </button>
                      <a
                        href={`mailto:${quote.email}?subject=Regarding your corporate quote request&body=Dear ${quote.name},`}
                        className="px-2 py-1 text-white rounded-lg transition text-xs"
                        title="Send Email"
                      >
                        <i className="fas fa-envelope mr-1 text-blue-600 hover:text-blue-700"></i>
                      </a>
                      <a
                        href={`tel:${quote.phone}`}
                        className="px-2 py-1 text-white rounded-lg transition text-xs"
                        title="Call"
                      >
                        <i className="fas fa-phone mr-1 text-green-600 hover:text-green-700"></i>
                        
                      </a>
                      <button
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="px-2 py-1 text-white rounded-lg transition text-xs"
                        title="Delete Quote Request"
                      >
                        <i className="fas fa-trash mr-1 text-red-600 hover:text-red-700"></i>
                        
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-lg p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <i className="fas fa-times text-lg"></i>
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quote Details
            </h3>

            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="font-semibold text-gray-900">Name:</span> {selectedQuote.name || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-gray-900">Email:</span> {selectedQuote.email || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-gray-900">Phone:</span> {selectedQuote.phone || "N/A"}
              </div>
              <div>
                <span className="font-semibold text-gray-900">Message:</span>
                <p className="mt-1 text-gray-600 whitespace-pre-wrap">{selectedQuote.message || "No message provided"}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Status:</span>{" "}
                {getStatusBadge(selectedQuote.status || "New")}
              </div>
              <div>
                <span className="font-semibold text-gray-900">Created At:</span>{" "}
                {selectedQuote.createdAt.toLocaleDateString()}{" "}
                <span className="text-gray-400 text-xs">
                  ({selectedQuote.createdAt.toLocaleTimeString()})
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateQuotesPage;