import DOMPurify from 'dompurify';
import { USE_SUPABASE, USE_APPWRITE, USE_STANDALONE } from './config';
import supabaseApi from './lib/supabaseApi';
import appwriteApi from './lib/appwriteApi';
import { standaloneApi } from './lib/standaloneApi';

// Sanitization helper
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
    if (response.data !== undefined) response.data = sanitizeResponse(response.data);
    if (response.results !== undefined) response.results = sanitizeResponse(response.results);
  }
  return response;
};

// Hybrid API with automatic Appwrite → Supabase fallback on network errors
const createHybridApi = (primary, fallback) => {
  const isNetworkError = (error) => {
    if (!error.response) return true;
    if (error.response.status >= 500) return true;
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
        console.warn(`Primary DB ${method}(${path}) failed:`, error.message);
        console.warn('Falling back to secondary database');
        const fallbackResult = await fallback[method](path, payload);
        return sanitizeApiResponse(fallbackResult);
      }
      throw error;
    }
  };

  return { get: wrap('get'), post: wrap('post'), put: wrap('put'), delete: wrap('delete') };
};

// Determine mode: Appwrite, Supabase, Standalone, or Hybrid fallback
let apiInstance;
const ENABLE_FALLBACK = import.meta.env.VITE_ENABLE_FALLBACK === 'true' || import.meta.env.DEV;
const DUAL_WRITE_MODE = import.meta.env.DUAL_WRITE_MODE === 'true';

if (USE_APPWRITE) {
  if (DUAL_WRITE_MODE && ENABLE_FALLBACK) {
    console.warn('Initializing hybrid API: Appwrite primary, Supabase fallback (dual-write)');
    apiInstance = createHybridApi(appwriteApi, supabaseApi);
  } else {
    console.warn('Initializing Appwrite API');
    apiInstance = appwriteApi;
  }
} else if (USE_SUPABASE) {
  if (ENABLE_FALLBACK) {
    console.warn('Initializing hybrid API: Supabase primary, standalone fallback');
    apiInstance = createHybridApi(supabaseApi, standaloneApi);
  } else {
    console.warn('Initializing Supabase API');
    apiInstance = supabaseApi;
  }
} else {
  console.warn('Initializing standalone API (DATABASE_MODE=standalone)');
  apiInstance = standaloneApi;
}

export default apiInstance;
