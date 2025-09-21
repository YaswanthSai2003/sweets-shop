// src/components/transaction/TransactionList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const STATUSES = ['all', 'pending', 'in_progress', 'completed', 'rejected'];

const TransactionList = ({ isAdmin = false }) => {
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const base = isAdmin ? '/transactions' : '/transactions/user';
      const params = new URLSearchParams({ limit: 10, page, status: statusFilter !== 'all' ? statusFilter : '' });
      const res = await axios.get(`${API}${base}?${params.toString()}`);

      if (res.data.success) {
        setTransactions(prev => reset ? res.data.data.transactions : [...prev, ...res.data.data.transactions]);
        setHasMore(res.data.data.transactions.length === 10);
      } else {
        setError('Failed to load transactions');
      }
    } catch (err) {
      console.error('TransactionList fetch error:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTransactions(true);
  }, [statusFilter]);

  useEffect(() => {
    if (page > 1) fetchTransactions();
  }, [page]);

  if (loading && page === 1) {
    return <Loading text="Loading transactions..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => fetchTransactions(true)} />;
  }

  return (
    <div>
      <div className="flex items-center mb-4 space-x-4">
        <label className="text-sm font-medium">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>
      </div>

      {transactions.length === 0 ? (
        <p className="text-center text-gray-600">No transactions found.</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map(tx => (
            <li key={tx._id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Order #{tx._id.slice(-6)}</span>
                <span className="text-sm text-gray-500">{formatDate(tx.createdAt)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  {tx.items?.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      {item.sweetName} × {item.quantity}
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(tx.totalAmount || 0)}</div>
                  <div className="text-xs text-gray-500">{tx.status.replace('_', ' ')}</div>
                </div>
                {isAdmin && tx.adminResponse && (
                  <div className="italic text-sm text-gray-600">
                    Admin Response: {tx.adminResponse}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
