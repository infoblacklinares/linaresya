import * as Sentry from "@sentry/nextjs";

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Capture Replay for 10% of all sessions,
  // plus, capture 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  environment: process.env.NODE_ENV,
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content, but keep the media playback
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],
});
