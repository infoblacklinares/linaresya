// Config de Sentry para Node runtime (server actions, route handlers, RSC).
// Si SENTRY_DSN no esta seteado (dev local sin Sentry), no hace nada.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Sample rate de transacciones (performance). 0 = no enviar nada de
    // performance, solo errores. Si despues queres tracing, subi a 0.1
    tracesSampleRate: 0,
    // Captura de breadcrumbs y context. true por default, lo dejamos asi.
    debug: false,
    // Ambiente: production / preview. Vercel inyecta VERCEL_ENV.
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
  });
}
