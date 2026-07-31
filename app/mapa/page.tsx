import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import MapaExplorar, { type NegocioMapa } from "@/components/MapaExplorar";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

export const metadata: Metadata = {
  title: "Mapa de negocios de Linares | LinaresYa",
  description:
    "Explora en el mapa todos los negocios, servicios y locales de Linares. Filtra por categoría y encuentra lo más cercano a ti.",
  alternates: { canonical: `${SITE_URL}/mapa` },
};

export const revalidate = 300; // 5 min

export default async function MapaPage() {
  const { data } = await supabase
    .from("negocios")
    .select(
      "id, nombre, slug, lat, lng, plan, verificado, categorias:categoria_id(nombre, slug, emoji)",
    )
    .eq("activo", true)
    .not("lat", "is", null)
    .not("lng", "is", null);

  const negocios: NegocioMapa[] = ((data ?? []) as unknown[]).flatMap((r) => {
    const x = r as Record<string, unknown>;
    const catRaw = Array.isArray(x.categorias) ? (x.categorias as unknown[])[0] : x.categorias;
    if (!catRaw || typeof catRaw !== "object") return [];
    const cat = catRaw as Record<string, unknown>;
    const lat = Number(x.lat);
    const lng = Number(x.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
    return [
      {
        id: String(x.id),
        nombre: String(x.nombre ?? ""),
        url: `/${String(cat.slug)}/${String(x.slug)}`,
        lat,
        lng,
        emoji: String(cat.emoji ?? "🏪"),
        categoriaSlug: String(cat.slug ?? ""),
        categoriaNombre: String(cat.nombre ?? ""),
        premium: x.plan === "premium",
        verificado: Boolean(x.verificado),
      },
    ];
  });

  return (
    <main className="flex-1 w-full pb-24">
      <div className="mx-auto w-full max-w-2xl lg:max-w-full lg:px-8 xl:px-14 px-4 py-6">
        <Link href="/" className="text-xs font-semibold text-[#8E8279] hover:text-[#1A1410]">
          ← Volver al inicio
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#1A1410]">
          🗺️ Mapa de Linares
        </h1>
        <p className="mt-1 text-sm text-[#8E8279] mb-4">
          Todos los negocios del directorio en el mapa. Filtra por categoría o busca lo más cerca de ti.
        </p>

        {negocios.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#E8E4DE] p-8 text-center">
            <p className="text-sm font-semibold text-[#1A1410]">Aún no hay negocios con ubicación</p>
          </div>
        ) : (
          <MapaExplorar negocios={negocios} />
        )}
      </div>
    </main>
  );
}
