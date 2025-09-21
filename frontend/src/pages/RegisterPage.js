import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { validateEmail, validatePassword, showToast } from '../utils/helpers';
import Loading from '../components/common/Loading';

const RegisterPage = () => {
  const { register, loading, error, clearError } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearError();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateEmail(form.email)) {
      showToast('Invalid email address', 'error');
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    const passCheck = validatePassword(form.password);
    if (!passCheck.isValid) {
      showToast('Password must be ≥6 chars, include upper, lower, number', 'error');
      return;
    }
    const res = await register(form.name.trim(), form.email.trim(), form.password);
    if (res.success) {
      clearCart();
      showToast('Registered successfully', 'success');
      navigate('/dashboard');
    }
  };

  if (loading) return <Loading text="Registering..." />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full btn btn-primary"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
