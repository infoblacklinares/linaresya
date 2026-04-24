import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

// Imagen Open Graph dinamica para paginas de categoria /[slug].
// Se genera automaticamente cuando alguien comparte por ejemplo
// linaresya.cl/comida-rapida. Muestra emoji, nombre categoria, "en Linares"
// y el branding.

export const runtime = "nodejs";
export const alt = "Categoria en LinaresYa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FG = "#0f172a";
const MUTED = "#64748b";
const ACCENT = "#f59e0b";
const BG = "#fffaf0";

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { data } = await supabase
    .from("categorias")
    .select("id, nombre, emoji")
    .eq("slug", slug)
    .eq("activa", true)
    .single();

  const cat =
    (data as { id: number; nombre: string; emoji: string } | null) ?? null;
  const nombre = cat?.nombre ?? "Directorio local";
  const emoji = cat?.emoji ?? "🔎";

  // Conteo de negocios activos en la categoria (best-effort, nunca rompe).
  let cantidad = 0;
  if (cat) {
    try {
      const { count } = await supabase
        .from("negocios")
        .select("id", { count: "exact", head: true })
        .eq("activo", true)
        .eq("categoria_id", cat.id);
      cantidad = count ?? 0;
    } catch {
      cantidad = 0;
    }
  }

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

        {/* Header: tag "Categoria" */}
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
          Categoria
        </div>

        {/* Body: emoji enorme + nombre */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div style={{ fontSize: 180, lineHeight: 1, display: "flex" }}>
            {emoji}
          </div>
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
          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: MUTED,
              fontWeight: 600,
            }}
          >
            {cantidad > 0
              ? `${cantidad} ${cantidad === 1 ? "negocio" : "negocios"} en Linares`
              : "Directorio local de Linares"}
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
