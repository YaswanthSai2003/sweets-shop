import React, { createContext, useContext, useState } from 'react';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  const clearTransactions = () => setTransactions([]);

  return (
    <TransactionContext.Provider
      value={{ transactions, setTransactions, clearTransactions }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const ctx = useContext(TransactionContext);
  if (!ctx)
    throw new Error('useTransactions must be used within TransactionProvider');
  return ctx;
};
