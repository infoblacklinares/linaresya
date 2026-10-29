import { ImageResponse } from "next/og";

// Imagen Open Graph de respaldo para fichas de negocio.
// No consulta Supabase durante la recopilación de páginas de Next.js.
// Si la ficha tiene una foto_portada, generateMetadata define esa imagen;
// esta tarjeta genérica solo se usa cuando no hay foto disponible.

export const runtime = "nodejs";
export const alt = "Negocios y servicios locales en LinaresYa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Estilo alineado con la identidad visual de LinaresYa.
const FG = "#0f172a";
const MUTED = "#64748b";
const ACCENT = "#2B6E80";
const BG = "#F9F8F6";

export default function Image() {
  const nombre = "Encuentra negocios en Linares";
  const categoriaNombre = "Directorio local";
  const emoji = "📍";
  const verificado = false;
  const premium = false;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Franja decorativa amber arriba */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: ACCENT,
            display: "flex",
          }}
        />

        {/* Header: categoria */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 36,
            color: MUTED,
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: 64 }}>{emoji}</span>
          <span>{categoriaNombre}</span>
        </div>

        {/* Body: nombre grande */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 1040,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 12,
            }}
          >
            {verificado && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#d1fae5",
                  color: "#065f46",
                  fontSize: 22,
                  fontWeight: 700,
                  padding: "6px 16px",
                  borderRadius: 999,
                }}
              >
                ✓ Verificado
              </div>
            )}
            {premium && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fef3c7",
                  color: "#78350f",
                  fontSize: 22,
                  fontWeight: 700,
                  padding: "6px 16px",
                  borderRadius: 999,
                }}
              >
                ★ Premium
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: nombre.length > 40 ? 80 : 104,
              fontWeight: 900,
              color: FG,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            {nombre}
          </div>
        </div>

        {/* Footer: Linares badge + branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: FG,
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 999,
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            <span>📍</span>
            <span>Linares · Maule · Chile</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 36,
              fontWeight: 800,
              color: FG,
              letterSpacing: "-0.02em",
            }}
          >
            <span>Linares</span>
            <span style={{ color: ACCENT }}>Ya</span>
            <span style={{ color: MUTED, fontWeight: 600 }}>.cl</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
