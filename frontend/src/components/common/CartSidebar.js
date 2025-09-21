import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency, showToast } from '../../utils/helpers';
import CheckoutModal from './CheckoutModal';

const CartSidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { items, total, updateCartItem, removeFromCart, clearCart, checkout, loading } = useCart();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleConfirmCheckout = async (customerInfo) => {
    try {
      const result = await checkout(customerInfo, user._id);
      if (result.success) {
        showToast('Purchase completed successfully!', 'success');
        setShowCheckoutModal(false);
        onClose();
        window.location.reload(); // Refresh to update stock
      } else {
        showToast(result.message || 'Checkout failed', 'error');
      }
    } catch (error) {
      showToast('Checkout failed. Please try again.', 'error');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🛒</span>
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.sweetId} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <span className="text-2xl">{item.image}</span>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartItem(item.sweetId, item.quantity - 1, user._id)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                        >
                          −
                        </button>
                        
                        <span className="w-8 text-center">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateCartItem(item.sweetId, item.quantity + 1, user._id)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                        <button
                          onClick={() => removeFromCart(item.sweetId, user._id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-orange-600">
                    {formatCurrency(total)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full btn btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Checkout'}
                  </button>
                  
                  <button
                    onClick={() => clearCart(user._id)}
                    className="w-full btn btn-secondary"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        items={items}
        total={total}
        onConfirm={handleConfirmCheckout}
        isAdmin={user?.role === 'admin'}
      />
    </>
  );
};

export default CartSidebar;
