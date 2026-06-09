import DOMPurify from 'dompurify';
import { USE_APPWRITE, USE_POSTGRES, USE_STANDALONE } from './config';
import appwriteApi from './lib/appwriteApi';
import { standaloneApi } from './lib/standaloneApi';
import postgresApi from './lib/postgresApi';

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
    if (response.data !== undefined) {response.data = sanitizeResponse(response.data);}
    if (response.results !== undefined) {response.results = sanitizeResponse(response.results);}
  }
  return response;
};

// Hybrid API with automatic Appwrite → Supabase fallback on network errors
const createHybridApi = (primary, fallback) => {
  const isNetworkError = (error) => {
    if (!error.response) {return true;}
    if (error.response.status >= 500) {return true;}
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

// Determine mode: Appwrite or Standalone (Supabase removed)
let apiInstance;
const ENABLE_FALLBACK = import.meta.env.VITE_ENABLE_FALLBACK === 'true' || import.meta.env.DEV;

if (USE_APPWRITE) {
  if (ENABLE_FALLBACK) {
    console.warn('Initializing hybrid API: Appwrite primary, Standalone fallback');
    apiInstance = createHybridApi(appwriteApi, standaloneApi);
  } else {
    console.warn('Initializing Appwrite API');
    apiInstance = appwriteApi;
  }
  } else if (USE_STANDALONE) {
    console.warn('Initializing standalone API (DATABASE_MODE=standalone)');
    apiInstance = standaloneApi;
  } else if (USE_POSTGRES) {
    console.warn('Initializing Postgres API (DATABASE_MODE=postgres)');
    apiInstance = postgresApi;
  } else {
    throw new Error('Unsupported DATABASE_MODE. Use "appwrite", "postgres", or "standalone".');
  }

export default apiInstance;
