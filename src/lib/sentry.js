import * as Sentry from '@sentry/react'

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return // don't init if no DSN configured

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE, // 'development' or 'production'
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,  // privacy: mask student/parent data
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.2 : 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: import.meta.env.MODE === 'production' ? 1.0 : 0,
    beforeSend(event) {
      // Strip any PII from breadcrumbs
      return event
    },
  })
}

export { Sentry }
