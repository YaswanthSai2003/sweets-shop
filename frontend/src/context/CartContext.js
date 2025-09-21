import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { sweetAPI } from '../services/api';
import { showToast } from '../utils/helpers';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  currentUserId: null,
  initialized: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'INITIALIZE_USER':
      return { 
        ...state, 
        currentUserId: action.payload,
        initialized: true,
        items: [], // Clear items when initializing new user
        total: 0
      };
    case 'LOAD_CART':
      return calculateTotal({ 
        ...state, 
        items: action.payload || [],
        currentUserId: action.userId,
        initialized: true
      });
    case 'ADD_ITEM': {
      if (!action.userId || state.currentUserId !== action.userId) {
        console.error('User mismatch in ADD_ITEM');
        return state;
      }
      
      const exists = state.items.find(i => i.sweetId === action.payload.sweetId);
      const requestedQty = exists
        ? exists.quantity + action.payload.quantity
        : action.payload.quantity;
      
      if (requestedQty > action.payload.availableQuantity) {
        showToast(`Only ${action.payload.availableQuantity} items available`, 'error');
        return state;
      }
      
      const items = exists
        ? state.items.map(i =>
            i.sweetId === action.payload.sweetId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          )
        : [...state.items, { ...action.payload, addedBy: action.userId }];
      
      return calculateTotal({ ...state, items });
    }
    case 'UPDATE_ITEM': {
      if (state.currentUserId !== action.userId) {
        console.error('User mismatch in UPDATE_ITEM');
        return state;
      }
      
      const items = state.items
        .map(i =>
          i.sweetId === action.payload.sweetId
            ? { ...i, quantity: action.payload.quantity }
            : i
        )
        .filter(i => i.quantity > 0);
      return calculateTotal({ ...state, items });
    }
    case 'REMOVE_ITEM': {
      if (state.currentUserId !== action.userId) {
        console.error('User mismatch in REMOVE_ITEM');
        return state;
      }
      
      const items = state.items.filter(i => i.sweetId !== action.payload);
      return calculateTotal({ ...state, items });
    }
    case 'CLEAR_CART':
      return { 
        ...state,
        items: [],
        total: 0,
        currentUserId: action.userId || state.currentUserId,
        initialized: true
      };
    default:
      return state;
  }
};

const calculateTotal = state => {
  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { ...state, total };
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getUserCartKey = useCallback((userId) => `sweetshop_cart_${userId}`, []);

  const loadUserCart = useCallback((userId) => {
    if (!userId) {
      dispatch({ type: 'CLEAR_CART', userId: null });
      return;
    }

    console.log(`Initializing cart for user: ${userId}`);
    
    // First initialize the user
    dispatch({ type: 'INITIALIZE_USER', payload: userId });
    
    const cartKey = getUserCartKey(userId);
    const json = localStorage.getItem(cartKey);
    
    if (json) {
      try {
        const items = JSON.parse(json);
        // Filter items to ensure they belong to this specific user
        const userItems = items.filter(item => 
          item.addedBy === userId || 
          (!item.addedBy && items.length > 0) // Handle legacy items without addedBy
        );
        
        // Update legacy items to have addedBy field
        const updatedItems = userItems.map(item => ({
          ...item,
          addedBy: userId
        }));
        
        console.log(`Loaded ${updatedItems.length} items for user ${userId}`);
        dispatch({ type: 'LOAD_CART', payload: updatedItems, userId });
        
        // Re-save with updated structure
        localStorage.setItem(cartKey, JSON.stringify(updatedItems));
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem(cartKey);
        dispatch({ type: 'CLEAR_CART', userId });
      }
    } else {
      dispatch({ type: 'CLEAR_CART', userId });
    }
  }, [getUserCartKey]);

  const saveUserCart = useCallback((userId, items) => {
    if (!userId) return;
    const cartKey = getUserCartKey(userId);
    const userItems = items.filter(item => item.addedBy === userId);
    localStorage.setItem(cartKey, JSON.stringify(userItems));
    console.log(`Saved ${userItems.length} items for user ${userId}`);
  }, [getUserCartKey]);

  const clearUserCart = useCallback((userId) => {
    if (!userId) return;
    const cartKey = getUserCartKey(userId);
    localStorage.removeItem(cartKey);
    console.log(`Cleared cart for user ${userId}`);
  }, [getUserCartKey]);

  // Auto-save when items change
  useEffect(() => {
    if (state.currentUserId && state.initialized && state.items) {
      saveUserCart(state.currentUserId, state.items);
    }
  }, [state.items, state.currentUserId, state.initialized, saveUserCart]);

  const addToCart = useCallback((sweet, qty = 1, userId) => {
    console.log(`Adding to cart: ${sweet.name} x ${qty} for user ${userId}`);
    console.log(`Current cart state: userId=${state.currentUserId}, initialized=${state.initialized}`);
    
    if (!userId) {
      showToast('Please login to add items to cart', 'error');
      return false;
    }

    if (!state.initialized || state.currentUserId !== userId) {
      showToast('User information not loaded. Please refresh the page.', 'error');
      return false;
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        sweetId: sweet._id,
        name: sweet.name,
        price: sweet.price,
        quantity: qty,
        image: sweet.image,
        imageUrl: sweet.imageUrl,
        availableQuantity: sweet.quantity
      },
      userId
    });
    return true;
  }, [state.currentUserId, state.initialized]);

  const updateCartItem = useCallback((sweetId, quantity, userId) => {
    if (!userId || state.currentUserId !== userId || !state.initialized) {
      console.error('User validation failed in updateCartItem');
      return;
    }
    dispatch({ type: 'UPDATE_ITEM', payload: { sweetId, quantity }, userId });
  }, [state.currentUserId, state.initialized]);

  const removeFromCart = useCallback((sweetId, userId) => {
    if (!userId || state.currentUserId !== userId || !state.initialized) {
      console.error('User validation failed in removeFromCart');
      return;
    }
    dispatch({ type: 'REMOVE_ITEM', payload: sweetId, userId });
  }, [state.currentUserId, state.initialized]);

  const clearCart = useCallback((userId) => {
    if (!userId) return;
    console.log(`Clearing cart for user ${userId}`);
    dispatch({ type: 'CLEAR_CART', userId });
    clearUserCart(userId);
  }, [clearUserCart]);

  const checkout = useCallback(async (customerInfo, userId) => {
    console.log(`Checkout attempt: user=${userId}, currentUser=${state.currentUserId}, initialized=${state.initialized}`);
    
    if (!userId || !state.initialized) {
      return { success: false, message: 'User not authenticated' };
    }

    if (state.currentUserId !== userId) {
      console.error(`User session mismatch: current=${state.currentUserId}, checkout=${userId}`);
      return { success: false, message: 'User session expired. Please refresh and try again.' };
    }

    if (state.items.length === 0) {
      return { success: false, message: 'Cart is empty' };
    }

    // Verify all items belong to the current user
    const invalidItems = state.items.filter(item => item.addedBy !== userId);
    if (invalidItems.length > 0) {
      console.error('Invalid items found in cart:', invalidItems);
      return { success: false, message: 'Invalid cart items detected. Please refresh and try again.' };
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const items = state.items.map(i => ({
        sweetId: i.sweetId,
        quantity: i.quantity
      }));
      
      const requestData = {
        items: items,
        customerInfo: customerInfo || {}
      };
      
      console.log('Sending purchase request with data:', requestData);
      
      const res = await sweetAPI.purchase(requestData);
      
      if (res.data.success) {
        console.log('Purchase successful:', res.data);
        clearCart(userId);
        return { success: true, data: res.data.data };
      } else {
        console.error('Purchase failed:', res.data);
        return { success: false, message: res.data.message || 'Purchase failed' };
      }
    } catch (err) {
      console.error('Checkout error:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Purchase failed';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentUserId, state.items, state.initialized, clearCart]);

  const getItemCount = useCallback(() => {
    return state.items.reduce((sum, i) => sum + i.quantity, 0);
  }, [state.items]);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        checkout,
        getItemCount,
        loadUserCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
