import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { sweetAPI, transactionAPI } from '../services/api';
import { formatCurrency, formatDate, showToast, isAdmin } from '../utils/helpers';
import SweetCard from '../components/sweet/SweetCard';
import SweetForm from '../components/sweet/SweetForm';
import TransactionList from '../components/transaction/TransactionList';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sweets, setSweets] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalTransactions: 0,
    averageTransaction: 0
  });
  const [showSweetForm, setShowSweetForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockingSweet, setRestockingSweet] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sweets first
      const sweetsRes = await sweetAPI.getAll({ limit: 100 });
      setSweets(sweetsRes.data.data.sweets || []);

      // Try to fetch stats, but don't fail if it errors
      try {
        const statsRes = await transactionAPI.getSalesReport();
        if (statsRes.data && statsRes.data.success) {
          setStats(statsRes.data.data.summary || {
            totalSales: 0,
            totalTransactions: 0,
            averageTransaction: 0
          });
        }
      } catch (statsError) {
        console.warn('Failed to load sales stats:', statsError);
        // Keep default stats values
        setStats({
          totalSales: 0,
          totalTransactions: 0,
          averageTransaction: 0
        });
      }

    } catch (err) {
      console.error('Admin dashboard error:', err);
      setError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin(user)) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleSweetSave = () => {
    setShowSweetForm(false);
    setEditingSweet(null);
    fetchData();
    showToast('Sweet saved successfully', 'success');
  };

  const handleEditSweet = (sweet) => {
    setEditingSweet(sweet);
    setShowSweetForm(true);
  };

  const handleDeleteSweet = async (sweetId) => {
    if (!window.confirm('Delete this sweet?')) return;
    try {
      await sweetAPI.delete(sweetId);
      showToast('Sweet deleted successfully', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete sweet', 'error');
    }
  };

  const handleRestockSweet = (sweet) => {
    setRestockingSweet(sweet);
    setRestockQuantity('');
    setShowRestockModal(true);
  };

  const confirmRestock = async () => {
    const qty = parseInt(restockQuantity, 10);
    if (!qty || qty <= 0) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }
    try {
      await sweetAPI.restock(restockingSweet._id, qty);
      showToast(`Restocked ${qty} units of ${restockingSweet.name}`, 'success');
      setShowRestockModal(false);
      setRestockingSweet(null);
      setRestockQuantity('');
      fetchData();
    } catch {
      showToast('Failed to restock sweet', 'error');
    }
  };

  const getTotalInventoryValue = () =>
    sweets.reduce((sum, s) => sum + (s.price || 0) * (s.quantity || 0), 0);

  const getLowStockCount = () =>
    sweets.filter(s => s.quantity > 0 && s.quantity < 5).length;

  const getOutOfStockCount = () =>
    sweets.filter(s => s.quantity === 0).length;

  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-12 rounded-xl shadow-lg text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading text="Loading admin dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard 👨‍💼</h1>
          <button
  onClick={() => {
    setActiveTab('inventory');  // Navigate to inventory tab
    setEditingSweet(null);
    setShowSweetForm(true);
  }}
  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium"
>
  ➕ Add Sweet
</button>

        </header>

        <ErrorMessage message={error} onRetry={fetchData} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalSales || 0)}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalTransactions || 0}
                </p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(getTotalInventoryValue())}
                </p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {getLowStockCount()}
                </p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {getOutOfStockCount()}
                </p>
              </div>
              <div className="text-3xl">🚫</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'inventory', name: 'Inventory', icon: '📦' },
                { id: 'transactions', name: 'Transactions', icon: '💳' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Business Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Average Order Value:</span>
                        <span className="font-medium">{formatCurrency(stats.averageTransaction || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Products:</span>
                        <span className="font-medium">{sweets.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Categories:</span>
                        <span className="font-medium">
                          {new Set(sweets.map(s => s.category)).size}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Inventory Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>In Stock</span>
                        </div>
                        <span className="font-medium">{sweets.filter(s => s.quantity > 5).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Low Stock</span>
                        </div>
                        <span className="font-medium">{getLowStockCount()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Out of Stock</span>
                        </div>
                        <span className="font-medium">{getOutOfStockCount()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Inventory Management</h2>
                
                {/* Sweet Form */}
                {showSweetForm && (
                  <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <SweetForm
                      sweet={editingSweet}
                      onSave={handleSweetSave}
                      onCancel={() => {
                        setShowSweetForm(false);
                        setEditingSweet(null);
                      }}
                    />
                  </div>
                )}

                {/* Restock Modal */}
                {showRestockModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <h3 className="text-xl font-bold mb-4">
                        Restock {restockingSweet?.name}
                      </h3>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Current Stock: {restockingSweet?.quantity} units
                        </p>
                        <label className="block text-sm font-medium mb-2">
                          Add Quantity:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={restockQuantity}
                          onChange={(e) => setRestockQuantity(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="Enter quantity to add"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={confirmRestock}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                        >
                          Confirm Restock
                        </button>
                        <button
                          onClick={() => setShowRestockModal(false)}
                          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sweets Grid */}
                {sweets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sweets.map(sweet => (
                      <SweetCard
                        key={sweet._id}
                        sweet={sweet}
                        showAdminActions={true}
                        onEdit={handleEditSweet}
                        onDelete={handleDeleteSweet}
                        onRestock={handleRestockSweet}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-bold mb-2">No products in inventory</h3>
                    <p className="text-gray-600 mb-6">Add your first sweet to get started</p>
                    <button
                      onClick={() => setShowSweetForm(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg"
                    >
                      Add Your First Sweet
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
                <TransactionList isAdmin={true} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
