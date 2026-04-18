import DOMPurify from 'dompurify';
import { USE_SUPABASE } from './config';
import supabaseApi from './lib/supabaseApi';
// import { standaloneApi } from './lib/standaloneApi';

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

// Determine mode: Supabase or Standalone (localStorage mock)
let apiInstance;

if (USE_SUPABASE) {
  // Use Supabase API implementation
  apiInstance = supabaseApi;
} else {
  // Fallback to dummy API for now
  apiInstance = {
    get: () => Promise.resolve({ data: [] }),
    post: () => Promise.resolve({ data: {} }),
    put: () => Promise.resolve({ data: {} }),
    delete: () => Promise.resolve({ data: {} }),
  };
}

export default apiInstance;
