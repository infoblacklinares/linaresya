import { ImageResponse } from "next/og";

// Imagen Open Graph de la home. Se ve cuando alguien comparte linaresya.cl.
// No hace queries: es una imagen generada al vuelo pero deterministica.

export const runtime = "nodejs";
export const alt = "LinaresYa - Lo mejor de Linares en un solo lugar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FG = "#0f172a";
const MUTED = "#64748b";
const ACCENT = "#f59e0b";
const BG = "#fffaf0";

export default function Image() {
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
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Franja decorativa */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: ACCENT,
            display: "flex",
          }}
        />

        {/* Esquinas: emojis decorativos */}
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 80,
            fontSize: 72,
            opacity: 0.25,
            display: "flex",
            gap: 16,
          }}
        >
          <span>🍔</span>
          <span>💇</span>
          <span>🔧</span>
        </div>

        {/* Header: tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 26,
            fontWeight: 700,
            color: MUTED,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          <span>📍</span>
          <span>Linares · Maule · Chile</span>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 180,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: FG,
              lineHeight: 1,
            }}
          >
            <span>Linares</span>
            <span style={{ color: ACCENT }}>Ya</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 48,
              fontWeight: 600,
              color: MUTED,
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            Lo mejor de Linares en un solo lugar
          </div>
        </div>

        {/* Footer: pildoras tipo categorias */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            width: "100%",
          }}
        >
          {[
            "🍔 Comida",
            "💇 Peluquerias",
            "🔧 Servicios",
            "🛒 Almacenes",
            "💊 Farmacias",
            "🚗 Taller",
          ].map((p) => (
            <div
              key={p}
              style={{
                display: "flex",
                background: "#fff",
                border: "2px solid #e2e8f0",
                color: FG,
                padding: "12px 20px",
                borderRadius: 999,
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
