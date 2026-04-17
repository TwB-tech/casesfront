import * as Sentry from './sentry';

/**
 * Centralized logging utility for WakiliWorld
 * - Sends errors to Sentry in production
 * - Logs to console in development
 * - Masks sensitive PII
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.info : LOG_LEVELS.debug;

const maskSensitiveData = (message) => {
  if (typeof message !== 'string') {return message;}

  // Mask email addresses
  let masked = message.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL REDACTED]'
  );

  // Mask phone numbers (Kenyan format and international)
  masked = masked.replace(
    /(\+?\d{3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    '[PHONE REDACTED]'
  );

  // Mask ID/Passport numbers
  masked = masked.replace(/\b[A-Z]\d{6,7}\b/g, '[ID REDACTED]');

  // Mask tokens and keys
  masked = masked.replace(/token[=:]\s*[^\s,}]+/gi, 'token=[REDACTED]');
  masked = masked.replace(/access[_-]?token[=:]\s*[^\s,}]+/gi, 'access_token=[REDACTED]');
  masked = masked.replace(/refresh[_-]?token[=:]\s*[^\s,}]+/gi, 'refresh_token=[REDACTED]');

  return masked;
};

const logger = {
  error: (...args) => {
    if (currentLevel < LOG_LEVELS.error) {return;}
    const maskedArgs = args.map((arg) => maskSensitiveData(arg));
    console.error('[ERROR]', ...maskedArgs);
    if (process.env.NODE_ENV === 'production') {
      const error = args.find((arg) => arg instanceof Error);
      Sentry.captureException(error || new Error(maskedArgs.join(' ')));
    }
  },

  warn: (...args) => {
    if (currentLevel < LOG_LEVELS.warn) {return;}
    console.warn('[WARN]', ...args.map((arg) => maskSensitiveData(arg)));
  },

  info: (...args) => {
    if (currentLevel < LOG_LEVELS.info) {return;}
    console.info('[INFO]', ...args.map((arg) => maskSensitiveData(arg)));
  },

  debug: (...args) => {
    if (currentLevel < LOG_LEVELS.debug) {return;}
    console.debug('[DEBUG]', ...args.map((arg) => maskSensitiveData(arg)));
  },

  // Context-aware error logging
  logError: (error, context = {}) => {
    const maskedError = maskSensitiveData(error.message || error);
    console.error(`[ERROR] ${maskedError}`, context);

    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, maskSensitiveData(value));
        });
        Sentry.captureException(error instanceof Error ? error : new Error(maskedError));
      });
    }
  },
};

export default logger;
