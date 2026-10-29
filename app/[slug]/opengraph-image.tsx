import { ImageResponse } from "next/og";

// Imagen Open Graph de respaldo para páginas de categoría /[slug].
// Se mantiene independiente de Supabase para que Next.js pueda recopilar
// los datos de página durante el build sin necesitar variables de entorno.

export const runtime = "nodejs";
export const alt = "Categoría local en LinaresYa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FG = "#0f172a";
const MUTED = "#64748b";
const ACCENT = "#2B6E80";
const BG = "#F9F8F6";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const { slug } = await params;
  const nombre =
    slug
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toLocaleUpperCase("es-CL") + word.slice(1))
      .join(" ") || "Directorio local";

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 700,
            color: MUTED,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Categoría local
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 180, lineHeight: 1, display: "flex" }}>🔎</div>
          <div
            style={{
              display: "flex",
              fontSize: nombre.length > 24 ? 96 : 120,
              fontWeight: 900,
              color: FG,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            {nombre}
          </div>
          <div style={{ display: "flex", fontSize: 36, color: MUTED, fontWeight: 600 }}>
            Directorio local de Linares
          </div>
        </div>
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
