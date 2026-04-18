import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';
import intitializeAnalytics from './analytics';
import { AuthProvider } from './contexts/authContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { initializeSentry } from './config/sentry';

// Initialize Sentry first (before any other errors)
initializeSentry();

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Initializing Google Analytics in the application
intitializeAnalytics();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
