import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://sweets-shop-y8lq.onrender.com';

// Set up axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to log requests
axios.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
axios.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (email, password) => 
    axios.post('/auth/login', { email, password }),
  
  register: (name, email, password) => 
    axios.post('/auth/register', { name, email, password }),
  
  getProfile: () => 
    axios.get('/auth/profile')
};

// Sweet API
export const sweetAPI = {
  getAll: (params = {}) => 
    axios.get('/sweets', { params }),
  
  search: (params = {}) => 
    axios.get('/sweets/search', { params }),
  
  getById: (id) => 
    axios.get(`/sweets/${id}`),
  
  create: (data) => 
    axios.post('/sweets', data),
  
  update: (id, data) => 
    axios.put(`/sweets/${id}`, data),
  
  delete: (id) => 
    axios.delete(`/sweets/${id}`),
  
  restock: (id, quantity) => {
    console.log(`Restocking sweet ${id} with quantity ${quantity}`);
    return axios.post(`/sweets/${id}/restock`, { quantity });
  },
  
  purchase: (data) => {
    console.log('Purchase API call with data:', data);
    // Ensure data structure is correct
    const purchaseData = {
      items: data.items || [],
      customerInfo: data.customerInfo || {}
    };
    console.log('Formatted purchase data:', purchaseData);
    return axios.post('/sweets/purchase', purchaseData);
  },
  
  getCategories: () => 
    axios.get('/sweets/categories')
};

// Transaction API
export const transactionAPI = {
  getUserTransactions: (params = {}) => 
    axios.get('/transactions/user', { params }),
  
  getAllTransactions: (params = {}) => 
    axios.get('/transactions', { params }),
  
  getById: (id) => 
    axios.get(`/transactions/${id}`),
  
  getSalesReport: (params = {}) => 
    axios.get('/transactions/sales-report', { params })
};

export default {
  auth: authAPI,
  sweets: sweetAPI,
  transactions: transactionAPI
};
