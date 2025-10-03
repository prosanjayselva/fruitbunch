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

const markerIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='%2300C853'%3E%3Cpath d='M16 2C10.48 2 6 6.48 6 12c0 8 10 18 10 18s10-10 10-18c0-5.52-4.48-10-10-10zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'/%3E%3C/svg%3E",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const AttendanceModal = ({ order, onClose, onStatusUpdate, onCancelDay }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Delivered' },
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending' },
      not_delivered: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Not Delivered' },
      cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Cancelled' },
      leave: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Leave' }
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>{config.label}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-2xl flex justify-between items-center">
          <h3 className="text-xl font-bold">Delivery Details</h3>
          <button onClick={onClose} className="text-white hover:text-emerald-200 transition-colors text-xl">
            ✕
          </button>
        </div>
        <div className="p-4 lg:p-6">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Customer Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <span className="text-sm font-semibold text-emerald-600">{order.customerName}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="text-sm font-semibold text-emerald-600">{order.shipping?.email}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <span className="text-sm font-semibold text-emerald-600">{order.shipping?.phone}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Days Left:</span>
                  <span className="text-sm font-semibold text-emerald-600">{order.daysLeft} days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span>{getStatusBadge(order.deliveryStatus)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Delivery Address</h4>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900">{order.shippingAddress?.address}</p>
                <p className="text-gray-600 mt-1">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p className="text-gray-600">Pincode: {order.shippingAddress?.pincode}</p>
                <p className="text-gray-600">Country: {order.shippingAddress?.country}</p>
              </div>
            </div>

            {order.shippingAddress?.location && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Delivery Location</h4>
                <MapContainer
                  center={[order.shippingAddress.location.lat, order.shippingAddress.location.lng]}
                  zoom={15}
                  scrollWheelZoom={false}
                  className="w-full h-64 rounded-xl"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
                    url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                  />
                  <Marker
                    position={[order.shippingAddress.location.lat, order.shippingAddress.location.lng]}
                    icon={markerIcon}
                  >
                    <Popup>Delivery Location for {order.customerName}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Update Delivery Status</h4>
              <select
                value={order.deliveryStatus || 'pending'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "cancel") {
                    onCancelDay(order.id);
                    onClose();
                  } else {
                    onStatusUpdate(order.id, value);
                    onClose();
                  }
                }}
                className="w-full text-sm border border-emerald-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="not_delivered">Not Delivered</option>
                <option value="leave">Leave</option>
                <option value="cancel">Cancel Today</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;