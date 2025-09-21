import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { TransactionProvider } from './context/TransactionContext';
import UserRequests from './pages/UserRequests';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequests from './pages/AdminRequests';
import ProtectedRoute from './components/common/ProtectedRoute';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <TransactionProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/requests"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminRequests />
                      </ProtectedRoute>
                    }
                  />
                  <Route
  path="/requests"
  element={
    <ProtectedRoute>
      <UserRequests />
    </ProtectedRoute>
  }
/>
                </Routes>
              </main>
            </div>
          </TransactionProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
