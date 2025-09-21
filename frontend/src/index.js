import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { TransactionProvider } from './context/TransactionContext';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <TransactionProvider>
          <App />
        </TransactionProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
