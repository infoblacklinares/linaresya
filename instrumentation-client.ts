// Config de Sentry para el cliente (browser). En Next 15+ este archivo
// reemplaza a sentry.client.config.ts y se carga automaticamente.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0,
    // Replays de session: util para debug visual de errores. Ratios bajos
    // para no consumir cuota gratis (50 sesiones/dia en plan free).
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    debug: false,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
    // Ignorar errores ruidosos comunes que no aportan info util
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
      // Errores de extensiones del browser
      /chrome-extension/i,
      /moz-extension/i,
    ],
  });
}

// Captura navegaciones para context (opcional pero util)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
