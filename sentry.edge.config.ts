// Config de Sentry para Edge runtime (middleware, edge functions).
// Misma logica que server.config: si no hay DSN, no hace nada.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0,
    debug: false,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
  });
}
