"use client";

import Link from "next/link";

// Error boundary global de Next 13+. Sin Sentry por ahora — los errores
// se loguean a Vercel Functions Logs automaticamente.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          fontFamily: "-apple-system, Segoe UI, Roboto, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            background: "#fff",
            borderRadius: 24,
            padding: 32,
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 8 }}>{"⚠️"}</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>
            Algo salió mal
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>
            Tuvimos un error inesperado. Probá recargar.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 11,
                color: "#94a3b8",
                fontFamily: "monospace",
                marginBottom: 24,
              }}
            >
              Codigo: {error.digest}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#0f172a",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
            <Link
              href="/"
              style={{
                display: "inline-block",
                background: "#f1f5f9",
                color: "#0f172a",
                textDecoration: "none",
                padding: "10px 20px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
