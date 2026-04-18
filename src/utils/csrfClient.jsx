import { generateCSRFToken, validateCSRFToken } from '../utils/csrf';

// Initialize CSRF token on app load
export const initCSRF = () => {
  let token = sessionStorage.getItem('csrf_token');
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem('csrf_token', token);
  }
  return token;
};

// Get current CSRF token (ensures one exists in storage)
export const getCSRFToken = () => {
  let token = sessionStorage.getItem('csrf_token');
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem('csrf_token', token);
  }
  return token;
};

// Validate incoming CSRF token (for server use)
export const verifyCSRFToken = (token) => {
  return validateCSRFToken(token);
};

// Middleware to attach CSRF token to axios requests
export const withCSRF = (config) => {
  const token = getCSRFToken();
  return {
    ...config,
    headers: {
      ...config.headers,
      'X-CSRF-Token': token,
    },
  };
};
