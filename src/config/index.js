/**
 * Application Configuration
 * Centralized config for feature flags and environment settings
 */

// Database mode flag: 'supabase' | 'standalone' (localStorage mock)
const dbMode =
  import.meta.env.DATABASE_MODE ||
  import.meta.env.VITE_DATABASE_MODE ||
  import.meta.env.REACT_APP_DATABASE_MODE ||
  'standalone';
export const USE_SUPABASE = dbMode === 'supabase';
export const USE_STANDALONE = dbMode === 'standalone';

// Supabase Configuration - prioritizes plain env vars (no VITE_ prefix)
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
  USE_STANDALONE,
  SUPABASE_CONFIG,
  SECURITY_CONFIG,
  FEATURES,
};
