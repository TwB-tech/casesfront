import { useCallback } from 'react';
import DOMPurify from 'dompurify';

/**
 * Hook to sanitize user inputs and prevent XSS attacks
 * Use this for any user-generated content before rendering or storing
 */
export const useSanitize = () => {
  const sanitizeHTML = useCallback((dirty) => {
    if (typeof dirty !== 'string') {
      return dirty;
    }
    return DOMPurify.sanitize(dirty, {
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
  }, []);

  const sanitizeObject = useCallback(
    function recur(obj) {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map((item) => recur(item));
      }
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeHTML(value);
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = recur(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    },
    [sanitizeHTML]
  );

  const sanitizeFormInput = useCallback((value) => {
    if (typeof value !== 'string') {
      return value;
    }
    return DOMPurify.sanitize(value.trim(), { ALLOWED_TAGS: [] });
  }, []);

  return {
    sanitizeHTML,
    sanitizeObject,
    sanitizeFormInput,
  };
};

export default useSanitize;
