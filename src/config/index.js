/**
 * Application Configuration
 * Centralized config for feature flags and environment settings
 */

// AppWrite integration flag - reads from environment variable
// Must be set as REACT_APP_USE_APPWRITE in .env file
export const USE_APPWRITE = process.env.REACT_APP_USE_APPWRITE === 'true';

// AppWrite Configuration
export const APPWRITE_CONFIG = {
  ENDPOINT: process.env.REACT_APP_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  PROJECT_ID: process.env.REACT_APP_APPWRITE_PROJECT_ID,
  DATABASE_ID: process.env.REACT_APP_APPWRITE_DATABASE_ID || 'main',
};

// Security Configuration
export const SECURITY_CONFIG = {
  SESSION_COOKIE_SECURE: process.env.REACT_APP_SESSION_COOKIE_SECURE === 'true',
  SESSION_COOKIE_SAMESITE: process.env.REACT_APP_SESSION_COOKIE_SAMESITE || 'Strict',
  CSRF_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  ENCRYPTION_ITERATIONS: 100000,
};

// Feature Flags
export const FEATURES = {
  ENABLE_AUDIT_LOGS: true,
  ENABLE_REALTIME: true,
  ENABLE_STORAGE: true,
};

// Validate required configuration on startup
export const validateConfig = () => {
  const errors = [];

  if (USE_APPWRITE && !APPWRITE_CONFIG.PROJECT_ID) {
    errors.push('REACT_APP_APPWRITE_PROJECT_ID is required when USE_APPWRITE=true');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:', errors);
    throw new Error('Invalid configuration: ' + errors.join(', '));
  }
};

// Run validation in development
if (process.env.NODE_ENV !== 'production') {
  try {
    validateConfig();
  } catch (error) {
    console.warn('Config validation failed:', error.message);
  }
}

export default {
  USE_APPWRITE,
  APPWRITE_CONFIG,
  SECURITY_CONFIG,
  FEATURES,
};
