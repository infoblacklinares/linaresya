import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

// Imagen Open Graph dinamica para /[slug]/[negocio].
// Next la usa automaticamente como fallback si generateMetadata no define
// openGraph.images. Cuando un negocio no tiene foto_portada, esta imagen
// bonita con el nombre + categoria es lo que ve el que comparte el link
// por WhatsApp, Twitter, Facebook, etc.

export const runtime = "nodejs";
export const alt = "Negocio en LinaresYa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Tamaños/colores inspirados en el estilo de la app (blanco + amber accent).
const FG = "#0f172a";
const MUTED = "#64748b";
const ACCENT = "#f59e0b"; // amber-500
const BG = "#fffaf0"; // crema muy tenue

export default async function Image({
  params,
}: {
  params: { slug: string; negocio: string };
}) {
  const { slug: categoriaSlug, negocio: negocioSlug } = params;

  // Fetch categoria + negocio en paralelo. Si algo falla, igual
  // devolvemos una imagen con el fallback generico.
  const [{ data: cat }, { data: negArr }] = await Promise.all([
    supabase
      .from("categorias")
      .select("id, nombre, emoji")
      .eq("slug", categoriaSlug)
      .limit(1),
    supabase
      .from("negocios")
      .select("nombre, descripcion, verificado, plan, categoria_id")
      .eq("slug", negocioSlug)
      .eq("activo", true)
      .limit(5),
  ]);

  const categoria =
    (cat?.[0] as { id: number; nombre: string; emoji: string } | undefined) ??
    null;
  const negocio =
    (negArr as
      | Array<{
          nombre: string;
          descripcion: string | null;
          verificado: boolean;
          plan: "basico" | "premium";
          categoria_id: number | null;
        }>
      | null
    )?.find((n) => !categoria || n.categoria_id === categoria.id) ?? null;

  const nombre = negocio?.nombre ?? "Negocio en LinaresYa";
  const categoriaNombre = categoria?.nombre ?? "Directorio";
  const emoji = categoria?.emoji ?? "📍";
  const verificado = negocio?.verificado ?? false;
  const premium = negocio?.plan === "premium";

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
