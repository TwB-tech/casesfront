import DOMPurify from 'dompurify';
import { USE_SUPABASE } from './config';
import supabaseApi from './lib/supabaseApi';
import { standaloneApi } from './lib/standaloneApi';

// Sanitization helper (kept for compatibility but Supabase handles most)
const sanitizeResponse = (value) => {
  if (typeof value === 'string') {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [
        'b',
        'i',
        'em',
        'strong',
        'a',
        'p',
        'br',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      ALLOWED_URI_REGEXP: /^https?:\/\//,
    });
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeResponse(item));
  }
  if (typeof value === 'object' && value !== null) {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      if (
        typeof val === 'number' ||
        typeof val === 'boolean' ||
        val === null ||
        val === undefined
      ) {
        sanitized[key] = val;
      } else if (key.includes('id') && typeof val !== 'object') {
        sanitized[key] = val;
      } else if (['created_at', 'updated_at', 'date', 'timestamp', 'time'].includes(key)) {
        sanitized[key] = val;
      } else if (typeof val === 'string') {
        sanitized[key] = DOMPurify.sanitize(val, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
          ALLOWED_ATTR: ['href', 'target', 'rel'],
          ALLOW_DATA_ATTR: false,
        });
      } else if (typeof val === 'object' && val !== null) {
        sanitized[key] = sanitizeResponse(val);
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }
  return value;
};

// Response sanitization wrapper
const sanitizeApiResponse = (response) => {
  if (response && typeof response === 'object') {
    if (response.data !== undefined) {
      response.data = sanitizeResponse(response.data);
    }
    if (response.results !== undefined) {
      response.results = sanitizeResponse(response.results);
    }
  }
  return response;
};

// Hybrid API with automatic Supabase → standalone fallback on network errors
const createHybridApi = (primary, fallback) => {
  const isNetworkError = (error) => {
    // No response object = network/connectivity error
    if (!error.response) {
      return true;
    }
    // Server errors (5xx) - Supabase may be down
    if (error.response.status >= 500) {
      return true;
    }
    // Connection errors typically have specific messages
    const msg = error.message?.toLowerCase() || '';
    if (
      msg.includes('network') ||
      msg.includes('failed to fetch') ||
      msg.includes('econnrefused')
    ) {
      return true;
    }
    return false;
  };

  const wrap = (method) => async (path, payload) => {
    try {
      const result = await primary[method](path, payload);
      return sanitizeApiResponse(result);
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn(`Supabase ${method}(${path}) failed:`, error.message);
        console.warn('Falling back to standalone API');
        const fallbackResult = await fallback[method](path, payload);
        return sanitizeApiResponse(fallbackResult);
      }
      // Auth errors (401, 403) or client errors - don't fallback
      throw error;
    }
  };

  return {
    get: wrap('get'),
    post: wrap('post'),
    put: wrap('put'),
    delete: wrap('delete'),
  };
};

// Determine mode: Supabase-only, Standalone-only, or Hybrid fallback
let apiInstance;
const ENABLE_STANDALONE_FALLBACK =
  import.meta.env.VITE_ENABLE_STANDALONE_FALLBACK === 'true' || import.meta.env.DEV;

if (USE_SUPABASE) {
  if (ENABLE_STANDALONE_FALLBACK) {
    console.warn('Initializing hybrid API: Supabase primary, standalone fallback');
    apiInstance = createHybridApi(supabaseApi, standaloneApi);
  } else {
    console.warn('Initializing Supabase API without standalone fallback');
    apiInstance = supabaseApi;
  }
} else {
  // Pure standalone mode (no Supabase)
  console.warn('Initializing standalone API (DATABASE_MODE=standalone)');
  apiInstance = standaloneApi;
}

export default apiInstance;
