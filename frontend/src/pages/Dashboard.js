import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { sweetAPI, transactionAPI } from '../services/api';
import { formatCurrency, formatDate, showToast } from '../utils/helpers';
import SweetCard from '../components/sweet/SweetCard';
import CheckoutModal from '../components/common/CheckoutModal';
import RequestModal from '../components/common/RequestModal';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { items, total, checkout, getItemCount, loadUserCart } = useCart();
  const [sweets, setSweets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  console.log('Dashboard - Auth state:', { isAuthenticated, userId: user?._id, authLoading });

  // Load user cart when user is authenticated and loaded
  useEffect(() => {
    if (isAuthenticated && user?._id && !authLoading) {
      console.log('Loading cart for user:', user._id);
      loadUserCart(user._id);
    }
  }, [isAuthenticated, user?._id, authLoading, loadUserCart]);

  // Fetch data when filters change
  const fetchData = useCallback(async () => {
    if (authLoading) return; // Don't fetch if auth is still loading
    
    try {
      setLoading(true);
      setError(null);

      const promises = [
        sweetAPI.search({
          category: selectedCategory !== 'all' ? selectedCategory : '',
          name: searchTerm
        }),
        sweetAPI.getCategories()
      ];

      // Only fetch user transactions if authenticated
      if (isAuthenticated) {
        promises.push(transactionAPI.getUserTransactions({ limit: 5 }));
      }

      const responses = await Promise.all(promises);
      
      setSweets(responses[0].data.data.sweets || []);
      setCategories(responses[1].data.data.categories || []);
      
      if (isAuthenticated && responses[2]) {
        setTransactions(responses[2].data.data.transactions || []);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, isAuthenticated, authLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheckoutClick = () => {
    if (!isAuthenticated || !user?._id) {
      showToast('Please login to checkout', 'error');
      return;
    }
    
    if (!items.length) {
      showToast('Your cart is empty', 'error');
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleConfirmCheckout = async (customerInfo) => {
    if (!user?._id) {
      showToast('User session expired. Please login again.', 'error');
      return;
    }
    
    console.log('Confirming checkout for user:', user._id);
    const res = await checkout(customerInfo, user._id);
    if (res.success) {
      showToast('Purchase completed successfully!', 'success');
      setShowCheckoutModal(false);
      fetchData(); // Refresh to update stock
    } else {
      showToast(res.message || 'Checkout failed', 'error');
    }
  };

  const handleStockUpdate = (id, qty) => {
    setSweets(prev => prev.map(s =>
      s._id === id ? { ...s, quantity: Math.max(0, s.quantity - qty) } : s
    ));
  };

  if (authLoading) return <Loading text="Loading user session..." />;
  if (loading) return <Loading text="Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isAuthenticated && user ? `Welcome back, ${user.name}!` : 'Welcome to Sweet Shop!'} 🍭
              </h1>
              <p className="text-gray-600">
                Explore our delicious collection of handcrafted sweets
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    📝 Send Request
                  </button>
                  
                  {items.length > 0 && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{getItemCount()}</div>
                          <div className="text-xs text-orange-800">Items</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(total)}
                          </div>
                          <div className="text-xs text-orange-800">Total</div>
                        </div>
                        <button
                          onClick={handleCheckoutClick}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <ErrorMessage message={error} onRetry={fetchData} />

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for sweets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sweets Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Sweets</h2>
          {sweets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sweets.map(sweet => (
                <SweetCard 
                  key={sweet._id} 
                  sweet={sweet} 
                  onStockUpdate={handleStockUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No sweets found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        {/* Recent Orders - Only show if authenticated */}
        {isAuthenticated && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <div key={transaction._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Order #{transaction._id.slice(-8)}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(transaction.createdAt)}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {transaction.items?.map((item, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                              {item.sweetName} × {item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-orange-600">
                          {formatCurrency(transaction.totalAmount)}
                        </div>
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mt-1">
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600">Start shopping to see your order history here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isAuthenticated && (
        <>
          <CheckoutModal
            isOpen={showCheckoutModal}
            onClose={() => setShowCheckoutModal(false)}
            items={items}
            total={total}
            onConfirm={handleConfirmCheckout}
            isAdmin={user?.role === 'admin'}
          />

          <RequestModal
            isOpen={showRequestModal}
            onClose={() => setShowRequestModal(false)}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
