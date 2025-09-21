import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency, isAdmin, showToast } from '../../utils/helpers';

const SweetCard = ({ sweet: initialSweet, onEdit, onDelete, onRestock, showAdminActions = false, onStockUpdate }) => {
  const { isAuthenticated, user } = useAuth();
  const { addToCart, items } = useCart();
  const [sweet, setSweet] = useState(initialSweet);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Calculate available stock (current stock - items in current user's cart)
  const cartItem = items.find(item => item.sweetId === sweet._id && item.addedBy === user?._id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const availableStock = Math.max(0, sweet.quantity - cartQuantity);
  
  const isOutOfStock = availableStock === 0;
  const isLowStock = availableStock > 0 && availableStock < 5;

  useEffect(() => {
    setSweet(initialSweet);
  }, [initialSweet]);

  const handlePurchase = async () => {
    if (!isAuthenticated || !user?._id) {
      showToast('Please login to make a purchase', 'error');
      return;
    }

    if (quantity > availableStock) {
      showToast(`Only ${availableStock} items available`, 'error');
      return;
    }

    setLoading(true);
    try {
      const success = addToCart(sweet, quantity, user._id);
      if (success) {
        showToast(`${sweet.name} added to cart successfully`, 'success');
        setQuantity(1);
        
        // Update local stock for immediate UI feedback
        if (onStockUpdate) {
          onStockUpdate(sweet._id, quantity);
        }
      }
    } catch (error) {
      showToast('Failed to add item to cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= availableStock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
      {/* Stock Status Badge */}
      {(isOutOfStock || isLowStock) && (
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isOutOfStock 
              ? 'bg-red-100 text-red-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isOutOfStock ? 'Out of Stock' : `${availableStock} left`}
          </span>
        </div>
      )}

      {/* Sweet Image */}
      <div className="relative h-48 bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        {sweet.imageUrl ? (
          <img 
            src={sweet.imageUrl} 
            alt={sweet.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
            {sweet.image}
          </span>
        )}
      </div>

      {/* Sweet Details */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{sweet.name}</h3>
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
            {sweet.category}
          </span>
        </div>

        {sweet.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {sweet.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-orange-600">
            {formatCurrency(sweet.price)}
          </span>
          <span className="text-sm text-gray-500">
            Stock: {sweet.quantity}
          </span>
        </div>

        {/* User Actions */}
        {!showAdminActions && (
          <div className="space-y-3">
            {isAuthenticated && !isOutOfStock && (
              <div className="flex items-center justify-center space-x-3 mb-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-gray-600"
                >
                  −
                </button>
                <span className="text-lg font-semibold min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= availableStock}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-gray-600"
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={!isAuthenticated || isOutOfStock || loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                isOutOfStock || !isAuthenticated
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </div>
              ) : !isAuthenticated ? (
                'Login to Purchase'
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : (
                `Add to Cart • ${formatCurrency(sweet.price * quantity)}`
              )}
            </button>
          </div>
        )}

        {/* Admin Actions */}
        {showAdminActions && isAdmin(user) && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEdit(sweet)}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Edit
            </button>
            <button
              onClick={() => onRestock(sweet)}
              className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Restock
            </button>
            <button
              onClick={() => onDelete(sweet._id)}
              className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 col-span-2"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SweetCard;
