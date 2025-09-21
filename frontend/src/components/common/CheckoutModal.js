import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';

const CheckoutModal = ({ isOpen, onClose, items, total, onConfirm, isAdmin = false }) => {
  const { user } = useAuth();
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    customerPhone: '',
    orderType: 'takeout',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!user?._id) {
      alert('Please login to complete checkout');
      return;
    }

    console.log(`Confirming checkout for user: ${user._id}`);
    setLoading(true);
    
    try {
      await onConfirm(isAdmin ? customerInfo : {});
    } catch (error) {
      console.error('Checkout confirmation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Checkout Confirmation</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* User Info Display */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Checkout for:</strong> {user?.name} ({user?.email})
            </p>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="border rounded-lg overflow-hidden">
              {items.map((item) => (
                <div key={item.sweetId} className="flex justify-between items-center p-4 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.image}</span>
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="bg-gray-50 p-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Customer Info */}
          {isAdmin && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerInfo.customerName}
                      onChange={(e) => setCustomerInfo(prev => ({
                        ...prev,
                        customerName: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.customerPhone}
                      onChange={(e) => setCustomerInfo(prev => ({
                        ...prev,
                        customerPhone: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Purpose *
                  </label>
                  <select
                    value={customerInfo.orderType}
                    onChange={(e) => setCustomerInfo(prev => ({
                      ...prev,
                      orderType: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="takeout">Takeout</option>
                    <option value="delivery">Delivery</option>
                    <option value="dine-in">Dine-in</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows="2"
                    placeholder="Special instructions..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
