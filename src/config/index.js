/**
 * Application Configuration
 * Centralized config for feature flags and environment settings
 */

// Database mode flag: 'supabase' | 'appwrite' | 'standalone' (localStorage mock)
const dbMode =
  import.meta.env.DATABASE_MODE ||
  import.meta.env.VITE_DATABASE_MODE ||
  import.meta.env.REACT_APP_DATABASE_MODE ||
  'standalone';

export const USE_SUPABASE = dbMode === 'supabase';
export const USE_APPWRITE = dbMode === 'appwrite';
export const USE_STANDALONE = dbMode === 'standalone';

// Appwrite Configuration
export const APPWRITE_CONFIG = {
  ENDPOINT:
    import.meta.env.APPWRITE_ENDPOINT ||
    import.meta.env.VITE_APPWRITE_ENDPOINT ||
    import.meta.env.REACT_APP_APPWRITE_ENDPOINT ||
    'https://cloud.appwrite.io/v1',
  PROJECT_ID:
    import.meta.env.APPWRITE_PROJECT_ID ||
    import.meta.env.VITE_APPWRITE_PROJECT_ID ||
    import.meta.env.REACT_APP_APPWRITE_PROJECT_ID,
  DATABASE_ID:
    import.meta.env.APPWRITE_DATABASE_ID ||
    import.meta.env.VITE_APPWRITE_DATABASE_ID ||
    import.meta.env.REACT_APP_APPWRITE_DATABASE_ID ||
    'default',
};

// Supabase Configuration - kept for backward compatibility/dual-write
export const SUPABASE_CONFIG = {
  URL:
    import.meta.env.SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.REACT_APP_SUPABASE_URL,
  ANON_KEY:
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.REACT_APP_SUPABASE_ANON_KEY,
};

// Security Configuration (kept for compatibility)
export const SECURITY_CONFIG = {
  SESSION_COOKIE_SECURE: import.meta.env.REACT_APP_SESSION_COOKIE_SECURE === 'true',
  SESSION_COOKIE_SAMESITE: import.meta.env.REACT_APP_SESSION_COOKIE_SAMESITE || 'Strict',
  CSRF_TOKEN_EXPIRY: 24 * 60 * 60 * 1000,
  ENCRYPTION_ITERATIONS: 100000,
};

// Feature Flags
export const FEATURES = {
  ENABLE_AUDIT_LOGS: true,
  ENABLE_REALTIME: true,
  ENABLE_STORAGE: true,
};

// Validate required configuration
export const validateConfig = () => {
  const errors = [];

  if (USE_APPWRITE && !APPWRITE_CONFIG.PROJECT_ID) {
    errors.push('APPWRITE_PROJECT_ID is required when DATABASE_MODE=appwrite');
  }

  if (USE_SUPABASE && (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY)) {
    errors.push('SUPABASE_URL and SUPABASE_ANON_KEY are required when DATABASE_MODE=supabase');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:', errors);
    throw new Error('Invalid configuration: ' + errors.join(', '));
  }
};

// Run validation in development (skip in production build to avoid build failures)
if (import.meta.env.DEV) {
  try {
    validateConfig();
  } catch (error) {
    console.warn('Config validation failed:', error.message);
  }
}

export default {
  USE_SUPABASE,
  USE_APPWRITE,
  USE_STANDALONE,
  SUPABASE_CONFIG,
  APPWRITE_CONFIG,
  SECURITY_CONFIG,
  FEATURES,
};
