import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

// Cart utility functions
export const cartUtils = {
  // Calculate item total
  getItemTotal: (item) => {
    return item.price * item.quantity;
  },

  // Calculate cart total
  getCartTotal: (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  // Get total item count
  getTotalItems: (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  // Check if item exists in cart
  isInCart: (items, sweetId) => {
    return items.some(item => item.sweetId === sweetId);
  },

  // Get item from cart
  getCartItem: (items, sweetId) => {
    return items.find(item => item.sweetId === sweetId);
  },

  // Validate cart item quantity against available stock
  validateQuantity: (requestedQuantity, availableStock) => {
    if (requestedQuantity <= 0) {
      return { isValid: false, message: 'Quantity must be greater than 0' };
    }
    
    if (requestedQuantity > availableStock) {
      return { 
        isValid: false, 
        message: `Only ${availableStock} items available in stock` 
      };
    }
    
    return { isValid: true, message: '' };
  },

  // Format cart for checkout
  formatForCheckout: (items) => {
    return items.map(item => ({
      sweetId: item.sweetId,
      quantity: item.quantity
    }));
  },

  // Calculate savings (if there were original prices)
  calculateSavings: (items, originalPrices = {}) => {
    return items.reduce((savings, item) => {
      const originalPrice = originalPrices[item.sweetId];
      if (originalPrice && originalPrice > item.price) {
        return savings + ((originalPrice - item.price) * item.quantity);
      }
      return savings;
    }, 0);
  }
};

// Cart validation rules
export const cartValidation = {
  maxQuantityPerItem: 10,
  maxItemsInCart: 20,
  maxCartValue: 1000,

  validateAddToCart: (currentCart, newItem, availableStock) => {
    const errors = [];

    // Check stock availability
    if (newItem.quantity > availableStock) {
      errors.push(`Only ${availableStock} items available`);
    }

    // Check max quantity per item
    const existingItem = currentCart.find(item => item.sweetId === newItem.sweetId);
    const totalQuantity = existingItem 
      ? existingItem.quantity + newItem.quantity 
      : newItem.quantity;

    if (totalQuantity > cartValidation.maxQuantityPerItem) {
      errors.push(`Maximum ${cartValidation.maxQuantityPerItem} items per product`);
    }

    // Check max items in cart
    const totalItems = cartUtils.getTotalItems(currentCart) + newItem.quantity;
    if (totalItems > cartValidation.maxItemsInCart) {
      errors.push(`Maximum ${cartValidation.maxItemsInCart} items in cart`);
    }

    // Check max cart value
    const cartTotal = cartUtils.getCartTotal(currentCart) + (newItem.price * newItem.quantity);
    if (cartTotal > cartValidation.maxCartValue) {
      errors.push(`Cart value cannot exceed $${cartValidation.maxCartValue}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default useCart;
