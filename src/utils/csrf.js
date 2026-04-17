/**
 * CSRF Protection Middleware for Express/Node.js
 * Validates CSRF tokens on state-changing requests
 */

const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
};

// Store CSRF token in server memory (for server.js usage)
const csrfStore = new Map();

const CSRF = {
  generate: () => {
    const token = generateCSRFToken();
    const sessionId = `sess_${Date.now()}`;
    csrfStore.set(sessionId, {
      token,
      created: Date.now(),
    });
    return { token, sessionId };
  },

  validate: (sessionId, token) => {
    const stored = csrfStore.get(sessionId);
    if (!stored) {return false;}
    if (Date.now() - stored.created > 3600000) {
      // 1 hour expiry
      csrfStore.delete(sessionId);
      return false;
    }
    const isValid = stored.token === token;
    if (isValid) {
      csrfStore.delete(sessionId); // One-time use
    }
    return isValid;
  },

  getToken: (sessionId) => {
    const stored = csrfStore.get(sessionId);
    return stored ? stored.token : null;
  },
};

module.exports = CSRF;
