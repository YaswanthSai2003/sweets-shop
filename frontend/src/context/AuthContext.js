import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      // Clear ALL cart data on logout
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sweetshop_cart_')) {
          localStorage.removeItem(key);
        }
      });
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const verifyToken = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/auth/profile`);
      
      if (response.data.success) {
        const user = response.data.data.user;
        
        // Clear other users' cart data but keep current user's cart
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sweetshop_cart_') && key !== `sweetshop_cart_${user._id}`) {
            localStorage.removeItem(key);
          }
        });
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { 
            user, 
            token: localStorage.getItem('token') 
          }
        });
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (res.data.success) {
        const { user, token } = res.data.data;
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Clear other users' cart data immediately
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sweetshop_cart_') && key !== `sweetshop_cart_${user._id}`) {
            localStorage.removeItem(key);
          }
        });
        
        // Dispatch login success and wait for it to complete
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        
        return { success: true, user };
      }
    } catch (err) {
      console.error('Login error:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err.response?.data?.message || 'Login failed'
      });
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      
      if (res.data.success) {
        const { user, token } = res.data.data;
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Clear all existing cart data for new registration
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sweetshop_cart_')) {
            localStorage.removeItem(key);
          }
        });
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        return { success: true, user };
      }
    } catch (err) {
      console.error('Registration error:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err.response?.data?.message || 'Registration failed'
      });
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    console.log('Logging out user:', state.user?.name);
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      clearError: () => dispatch({ type: 'CLEAR_ERROR' })
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
