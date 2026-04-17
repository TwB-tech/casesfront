/**
 * Application Configuration
 * Centralized config for feature flags and environment settings
 */

// Database mode flag: 'supabase' | 'standalone' (localStorage mock)
// Set REACT_APP_DATABASE_MODE in .env (default: 'standalone' for demo)
const dbMode = process.env.REACT_APP_DATABASE_MODE || 'standalone';
export const USE_SUPABASE = dbMode === 'supabase';
export const USE_STANDALONE = dbMode === 'standalone';

// Supabase Configuration
export const SUPABASE_CONFIG = {
  URL: process.env.REACT_APP_SUPABASE_URL,
  ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
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

  if (USE_SUPABASE && (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY)) {
    errors.push(
      'REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are required when DATABASE_MODE=supabase'
    );
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
  USE_SUPABASE,
  USE_STANDALONE,
  SUPABASE_CONFIG,
  SECURITY_CONFIG,
  FEATURES,
};
