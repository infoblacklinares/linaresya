import { ImageResponse } from "next/og";
import { getPost, posts } from "@/lib/blog-posts";

// OG image dinámica para artículos del blog.
// Next la inyecta automáticamente en og:image cuando el post no
// define una imagen manual en generateMetadata.

export const runtime = "nodejs";
export const alt = "Artículo en el Blog de LinaresYa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Paleta alineada con el header del blog (/blog/[slug]/page.tsx)
const TEAL      = "#2B6E80";
const TEAL_DARK = "#1f5268";
const WHITE     = "#ffffff";
const WHITE_60  = "rgba(255,255,255,0.60)";
const ACCENT    = "#f59e0b"; // amber — igual que en negocio OG

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);

  const titulo    = post?.titulo    ?? "Blog de LinaresYa";
  const emoji     = post?.emoji     ?? "📝";
  const categoria = post?.categoria ?? "Artículo";

  // Ajusta el tamaño de fuente según longitud del título para evitar overflow.
  const fontSize = titulo.length > 80 ? 56 : titulo.length > 50 ? 68 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`,
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Franja accent arriba */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: ACCENT,
            display: "flex",
          }}
        />

        {/* Categoría pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.15)",
            padding: "10px 24px",
            borderRadius: 999,
            alignSelf: "flex-start",
            fontSize: 28,
            fontWeight: 700,
            color: WHITE,
            letterSpacing: "0.04em",
          }}
        >
          <span style={{ fontSize: 36 }}>{emoji}</span>
          <span style={{ textTransform: "uppercase", fontSize: 22 }}>{categoria}</span>
        </div>

        {/* Título */}
        <div
          style={{
            display: "flex",
            fontSize,
            fontWeight: 900,
            color: WHITE,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            maxWidth: 1040,
          }}
        >
          {titulo}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Linares badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.15)",
              padding: "10px 22px",
              borderRadius: 999,
              fontSize: 24,
              fontWeight: 600,
              color: WHITE,
            }}
          >
            <span>📍</span>
            <span>Linares · Chile</span>
          </div>

          {/* Branding */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 40,
              fontWeight: 800,
              color: WHITE,
              letterSpacing: "-0.02em",
            }}
          >
            <span>Linares</span>
            <span style={{ color: ACCENT }}>Ya</span>
            <span style={{ color: WHITE_60, fontWeight: 600 }}>.cl</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
