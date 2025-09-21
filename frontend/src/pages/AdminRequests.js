import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { showToast, formatDate, isAdmin } from '../utils/helpers';

const AdminRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_URL}/requests/admin/all`);
      setRequests(res.data.data.requests || []);
    } catch (err) {
      console.error('Fetch requests error:', err);
      setError('Failed to load user requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin(user)) {
      fetchRequests();
    }
  }, [user]);

  const handleRespond = async (requestId, status, adminResponse) => {
    if (!adminResponse.trim()) {
      showToast('Please enter a response message', 'error');
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.put(`${API_URL}/requests/${requestId}/respond`, {
        status,
        adminResponse
      });
      showToast('Response sent successfully!', 'success');
      fetchRequests();
    } catch (err) {
      console.error('Respond error:', err);
      showToast('Failed to send response', 'error');
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view user requests.</p>
        </div>
      </div>
    );
  }

  if (loading) return <Loading size="lg" text="Loading user requests..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Requests 📨</h1>
          <p className="text-gray-600">Manage customer requests and send responses</p>
        </div>

        <ErrorMessage message={error} onRetry={fetchRequests} />

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'all', name: 'All Requests', count: requests.length },
                { id: 'pending', name: 'Pending', count: requests.filter(r => r.status === 'pending').length },
                { id: 'in_progress', name: 'In Progress', count: requests.filter(r => r.status === 'in_progress').length },
                { id: 'completed', name: 'Completed', count: requests.filter(r => r.status === 'completed').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    filter === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      filter === tab.id ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">
                {filter === 'all' ? 'No user requests at this time' : `No ${filter} requests`}
              </p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <div key={request._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{request.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.type === 'restock' ? 'bg-orange-100 text-orange-800' :
                          request.type === 'new_item' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.type.charAt(0).toUpperCase() + request.type.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        From: <span className="font-medium">{request.userId.name}</span> ({request.userId.email})
                        <br />
                        Sent: {formatDate(request.createdAt)}
                        {request.orderNumber && (
                          <>
                            <br />
                            Order #: <span className="font-medium">{request.orderNumber}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Request Message */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Message:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.message}</p>
                  </div>

                  {/* Request Items */}
                  {request.items && request.items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Requested Items:</h4>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="space-y-2">
                          {request.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <div>
                                <span className="font-medium">{item.sweetName}</span>
                                <span className="text-gray-600 ml-2">× {item.quantity}</span>
                              </div>
                              {item.notes && (
                                <span className="text-gray-500 text-xs">{item.notes}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Response */}
                  {request.adminResponse && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Admin Response:</h4>
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                        <p className="text-gray-700">{request.adminResponse}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Responded on: {formatDate(request.respondedAt)}
                          {request.respondedBy && (
                            <span> by {request.respondedBy.name}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          const response = prompt('Enter your response to mark as in progress:');
                          if (response) {
                            handleRespond(request._id, 'in_progress', response);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Mark In Progress
                      </button>
                      <button
                        onClick={() => {
                          const response = prompt('Enter completion message:');
                          if (response) {
                            handleRespond(request._id, 'completed', response);
                          }
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() => {
                          const response = prompt('Enter rejection reason:');
                          if (response) {
                            handleRespond(request._id, 'rejected', response);
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {request.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        const response = prompt('Enter completion message:');
                        if (response) {
                          handleRespond(request._id, 'completed', response);
                        }
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;
