import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupportedCurrencies, getCurrencyName } from '../utils/currency';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Get from localStorage default, or KES
    const saved = localStorage.getItem('userCurrency');
    return saved || 'KES';
  });

  // When user logs in, we could sync from server - placeholder
  // useEffect(() => {
  //   if (user?.currency) {
  //     setCurrency(user.currency);
  //     localStorage.setItem('userCurrency', user.currency);
  //   }
  // }, [user?.currency]);

  const changeCurrency = (newCurrency) => {
    if (!getSupportedCurrencies().includes(newCurrency)) {
      console.warn(`Unsupported currency: ${newCurrency}`);
      return;
    }
    setCurrency(newCurrency);
    localStorage.setItem('userCurrency', newCurrency);
    // TODO: Also persist to server via API when logged in
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
