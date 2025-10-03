import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom green marker
const markerIcon = new L.Icon({
    iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='%2300C853'%3E%3Cpath d='M16 2C10.48 2 6 6.48 6 12c0 8 10 18 10 18s10-10 10-18c0-5.52-4.48-10-10-10zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'/%3E%3C/svg%3E",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const UserDetailsModal = ({ subscription, onClose }) => {
    const { user, activeSubscription, orders } = subscription;

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Active' },
            expiring_soon: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Expiring Soon' },
            expired: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Expired' },
            not_subscribed: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Not Subscribed' },
        };
        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
        return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>{config.label}</span>;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-2xl flex justify-between items-center">
                    <h3 className="text-xl font-bold">User Details</h3>
                    <button onClick={onClose} className="text-white hover:text-emerald-200 transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 lg:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                        {/* Left Column - User Info */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4 text-lg">User Information</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">Name:</span>
                                    <span className="text-sm font-semibold text-emerald-600">{user?.name || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">Email:</span>
                                    <span className="text-sm font-semibold text-emerald-600">{user?.email}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">Phone:</span>
                                    <span className="text-sm font-semibold text-emerald-600">{user?.phone || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">Joined:</span>
                                    <span className="text-sm font-semibold text-emerald-600">
                                        {user?.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : "Unknown"}
                                    </span>
                                </div>
                            </div>

                            {/* Subscription Section */}
                            <h4 className="font-semibold text-gray-900 mb-4 mt-6 text-lg">Subscription</h4>
                            {activeSubscription ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-700">Plan:</span>
                                        <span className="text-sm font-semibold text-emerald-600">{activeSubscription.items?.[0]?.name || "Subscription"}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-700">Status:</span>
                                        <span>{getStatusBadge(activeSubscription.status)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-700">Days Left:</span>
                                        <span className="text-sm font-semibold text-emerald-600">{activeSubscription.daysLeft}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No active subscription</p>
                            )}
                        </div>

                        {/* Right Column - Location + Orders */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4 text-lg">Location</h4>
                            {activeSubscription?.location ? (
                                <MapContainer
                                    center={[activeSubscription.location.lat, activeSubscription.location.lng]}
                                    zoom={13}
                                    scrollWheelZoom={false}
                                    className="w-full h-64 rounded-xl"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
                                        url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                                    />
                                    <Marker
                                        position={[activeSubscription.location.lat, activeSubscription.location.lng]}
                                        icon={markerIcon}
                                    >
                                        <Popup>{user.name} ({user.email})</Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <p className="text-gray-500">Location not available</p>
                            )}

                            <h4 className="font-semibold text-gray-900 mb-4 mt-6 text-lg">Orders</h4>
                            {orders?.length > 0 ? (
                                <div className="space-y-3">
                                    {orders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                                            <div>
                                                <p className="font-medium text-gray-900">Order #{order.id}</p>
                                                <p className="text-sm text-emerald-600">₹{order.amount} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">{order.items?.[0]?.name || "Plan"}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No orders available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;