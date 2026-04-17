import * as Sentry from '@sentry/react';

export const initializeSentry = () => {
  if (process.env.NODE_ENV !== 'production' || !process.env.REACT_APP_SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    integrations: [
      Sentry.browserTracingIntegration({
        tracingOrigins: ['localhost', /^\//],
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    beforeSend(event, _hint) {
      // Sanitize sensitive data before sending
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }

      // Remove PII from user context
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      return event;
    },
    denyUrls: [
      // Don't send errors from these URLs
      /^\/api\/auth\/login/,
      /^\/api\/auth\/register/,
    ],
  });
};

export const captureException = (error, context = {}) => {
  Sentry.captureException(error, {
    contexts: {
      ...context,
    },
  });
};

export const captureMessage = (message, level = 'info') => {
  Sentry.captureMessage(message, level);
};

export default Sentry;
