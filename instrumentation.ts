// Hook que Next.js llama al inicio del runtime para registrar instrumentacion.
// Usamos esto para registrar Sentry en server (nodejs) y edge runtime.

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Captura errores no manejados desde Server Components (Next 15+).
export const onRequestError = Sentry.captureRequestError;
