/**
 * Security Utilities for WakiliWorld
 * Handles data encryption, sanitization, and session security
 */

// CSP Nonce generator for inline scripts/styles
export const generateNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return array.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Encrypt sensitive data before localStorage storage
export const encryptData = async (data, password) => {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Derive key from password
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
};

// Decrypt data from localStorage
export const decryptData = async (encryptedData, password) => {
  try {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    const encoder = new TextEncoder();

    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Sanitize HTML content to prevent XSS
export const sanitizeHTML = (dirty) => {
  if (typeof dirty !== 'string') {return dirty;}

  const temp = document.createElement('div');
  temp.textContent = dirty;
  return temp.innerHTML;
};

// Sanitize object with nested strings
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {return obj;}

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHTML(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Generate CSRF token
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

// Store CSRF token in sessionStorage (cleared on tab close)
export const setCSRFToken = () => {
  const token = generateCSRFToken();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

// Validate CSRF token
export const validateCSRFToken = (token) => {
  const stored = sessionStorage.getItem('csrf_token');
  return stored && token === stored;
};
