import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { isAdmin } from '../../utils/helpers';
import CartSidebar from './CartSidebar';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 text-orange-600">
              <span className="text-2xl">🍭</span>
              <span className="text-xl font-bold">Sweet Shop</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`text-gray-700 hover:text-orange-600 ${isActive('/') && 'text-orange-600'}`}
              >
                Home
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className={`text-gray-700 hover:text-orange-600 ${isActive('/dashboard') && 'text-orange-600'}`}
                  >
                    Dashboard
                  </Link>

                  {!isAdmin(user) && (
                    <Link
                      to="/requests"
                      className={`text-gray-700 hover:text-orange-600 ${isActive('/requests') && 'text-orange-600'}`}
                    >
                      My Requests
                    </Link>
                  )}

                  {isAdmin(user) && (
                    <>
                      <Link
                        to="/admin"
                        className={`text-gray-700 hover:text-orange-600 ${isActive('/admin') && 'text-orange-600'}`}
                      >
                        Admin
                      </Link>
                      <Link
                        to="/admin/requests"
                        className={`text-gray-700 hover:text-orange-600 ${isActive('/admin/requests') && 'text-orange-600'}`}
                      >
                        Requests
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative text-gray-700 hover:text-orange-600"
                  >
                    🛒
                    {getItemCount() > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getItemCount()}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-600">Hello, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">
                    Login
                  </Link>
                  <Link to="/register" className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700">
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-orange-600 p-2"
              >
                ☰
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 ${isActive('/') && 'bg-gray-100'}`}
                >
                  Home
                </Link>

                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 ${isActive('/dashboard') && 'bg-gray-100'}`}
                    >
                      Dashboard
                    </Link>

                    {!isAdmin(user) && (
                      <Link
                        to="/requests"
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 ${isActive('/requests') && 'bg-gray-100'}`}
                      >
                        My Requests
                      </Link>
                    )}

                    {isAdmin(user) && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 ${isActive('/admin') && 'bg-gray-100'}`}
                        >
                          Admin
                        </Link>
                        <Link
                          to="/admin/requests"
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 ${isActive('/admin/requests') && 'bg-gray-100'}`}
                        >
                          Requests
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setIsCartOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
                    >
                      🛒 Cart ({getItemCount()})
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </>
                )}

                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
