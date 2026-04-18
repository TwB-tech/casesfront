import * as Sentry from '@sentry/react';

export const initializeSentry = () => {
  const dsn =
    import.meta.env.SENTRY_DSN ||
    import.meta.env.VITE_SENTRY_DSN ||
    import.meta.env.REACT_APP_SENTRY_DSN;

  if (!dsn || import.meta.env.DEV) {
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
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
