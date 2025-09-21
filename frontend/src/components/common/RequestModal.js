import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { showToast } from '../../utils/helpers';
import axios from 'axios';

const RequestModal = ({ isOpen, onClose }) => {
  const { items, total } = useCart();
  const [requestData, setRequestData] = useState({
    type: 'restock',
    title: '',
    message: '',
    orderNumber: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requestData.title.trim() || !requestData.message.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const requestPayload = {
        type: requestData.type,
        title: requestData.title,
        message: requestData.message,
        orderNumber: requestData.orderNumber || '',
        items: requestData.type === 'restock' ? items.map(item => ({
          sweetName: item.name,
          quantity: item.quantity,
          notes: `Price: ${item.price}, Total: ${item.price * item.quantity}`
        })) : []
      };

      await axios.post(`${API_URL}/requests`, requestPayload);
      showToast('Request sent successfully to admin!', 'success');
      onClose();
      
      // Reset form
      setRequestData({
        type: 'restock',
        title: '',
        message: '',
        orderNumber: ''
      });
    } catch (error) {
      console.error('Request error:', error);
      showToast(error.response?.data?.message || 'Failed to send request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateOrderNumber = () => {
    const orderNum = `ORD${Date.now().toString().slice(-6)}`;
    setRequestData(prev => ({ ...prev, orderNumber: orderNum }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Send Request to Admin</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Type *
              </label>
              <select
                value={requestData.type}
                onChange={(e) => setRequestData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="restock">Request Restock</option>
                <option value="new_item">Request New Item</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>

            {requestData.type === 'restock' && items.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Current Cart Items to Restock:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <span>{item.image}</span>
                        <span>{item.name}</span>
                        <span className="text-gray-500">× {item.quantity}</span>
                      </div>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-orange-200">
                  <div className="flex justify-between font-semibold">
                    <span>Total Value:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={requestData.orderNumber}
                  onChange={(e) => setRequestData(prev => ({ ...prev, orderNumber: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter order number (optional)"
                />
                <button
                  type="button"
                  onClick={generateOrderNumber}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Title *
              </label>
              <input
                type="text"
                value={requestData.title}
                onChange={(e) => setRequestData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder={
                  requestData.type === 'restock' ? 'e.g., Restock Request for Popular Items' :
                  requestData.type === 'new_item' ? 'e.g., Request for Chocolate Truffles' :
                  'e.g., Question about delivery options'
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Message *
              </label>
              <textarea
                value={requestData.message}
                onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                rows="5"
                placeholder={
                  requestData.type === 'restock' 
                    ? 'Please describe which items need restocking and any specific requirements...'
                    : requestData.type === 'new_item'
                    ? 'Please describe the new item you would like us to add to our menu...'
                    : 'Please describe your inquiry in detail...'
                }
                required
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending Request...' : 'Send Request to Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
