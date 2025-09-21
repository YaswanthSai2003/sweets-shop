import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatDate } from '../utils/helpers';

const UserRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_URL}/requests/my-requests`);
      setRequests(res.data.data.requests || []);
    } catch (err) {
      console.error('Fetch user requests error:', err);
      setError('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <Loading text="Loading your requests..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Requests 📨</h1>
          <p className="text-gray-600">Track your requests and admin responses</p>
        </div>

        <ErrorMessage message={error} onRetry={fetchRequests} />

        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600">You haven't sent any requests to the admin</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map(request => (
              <div key={request._id} className="bg-white rounded-xl shadow-sm p-6">
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
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {request.type.charAt(0).toUpperCase() + request.type.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Sent: {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Your Message:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.message}</p>
                </div>

                {request.items && request.items.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Items:</h4>
                    <div className="bg-orange-50 rounded-lg p-4">
                      {request.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.sweetName} × {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {request.adminResponse && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                    <h4 className="font-semibold text-green-800 mb-2">Admin Response:</h4>
                    <p className="text-green-700">{request.adminResponse}</p>
                    <p className="text-sm text-green-600 mt-2">
                      Responded: {formatDate(request.respondedAt)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRequests;
