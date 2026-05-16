import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupportedCurrencies, getCurrencyName } from '../utils/currency';
import useAuth from '../hooks/useAuth';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currency, setCurrency] = useState(() => {
    // Get from localStorage default, or KES
    const saved = localStorage.getItem('userCurrency');
    return saved || 'KES';
  });

  // When user logs in, sync currency from server if available
  useEffect(() => {
    if (user?.currency) {
      const userCurrency = user.currency;
      if (getSupportedCurrencies().includes(userCurrency)) {
        setCurrency(userCurrency);
        localStorage.setItem('userCurrency', userCurrency);
      }
    }
  }, [user?.currency]);

  const changeCurrency = (newCurrency) => {
    if (!getSupportedCurrencies().includes(newCurrency)) {
      console.warn(`Unsupported currency: ${newCurrency}`);
      return;
    }
    setCurrency(newCurrency);
    localStorage.setItem('userCurrency', newCurrency);
    // Persist to server when logged in
    if (isAuthenticated && user) {
      // Fire-and-forget: best-effort server sync; failures are silent
      (async () => {
        try {
          const axios = (await import('../axiosConfig')).default;
          await axios.put('/auth/profile/', { currency: newCurrency }).catch(() => {});
        } catch { /* noop */ }
      })();
    }
  };

  const value = {
    currency,
    changeCurrency,
    currencyName: getCurrencyName(currency),
    supportedCurrencies: getSupportedCurrencies(),
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export default CurrencyContext;
