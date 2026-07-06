import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

export const metadata: Metadata = {
  title: "Ofertas y promociones en Linares - Solo por hoy | LinaresYa",
  description:
    "Las mejores ofertas, descuentos y promociones de los negocios de Linares. Actualizadas todos los días.",
  alternates: { canonical: `${SITE_URL}/ofertas` },
};

export const revalidate = 300; // 5 min

type Oferta = {
  id: number;
  titulo: string;
  descripcion: string | null;
  descuento_pct: number | null;
  precio_normal: number | null;
  precio_oferta: number | null;
  imagen_url: string | null;
  fecha_fin: string;
  boosteada: boolean;
  negocio: { nombre: string; slug: string; categoria_slug: string; emoji: string } | null;
};

export default async function OfertasPage() {
  const hoy = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("ofertas")
    .select("id, titulo, descripcion, descuento_pct, precio_normal, precio_oferta, imagen_url, fecha_fin, boosteada, negocios:negocio_id(nombre, slug, categorias:categoria_id(slug, emoji))")
    .eq("activa", true)
    .gte("fecha_fin", hoy)
    .order("boosteada", { ascending: false })
    .order("fecha_fin");

  const ofertas: Oferta[] = ((data ?? []) as unknown[]).map(r => {
    const x = r as Record<string, unknown>;
    const neg = Array.isArray(x.negocios) ? (x.negocios as unknown[])[0] : x.negocios;
    const negObj = (neg ?? {}) as Record<string, unknown>;
    const catRaw = Array.isArray(negObj.categorias) ? (negObj.categorias as unknown[])[0] : negObj.categorias;
    const cat = (catRaw ?? {}) as Record<string, unknown>;
    return {
      id: Number(x.id),
      titulo: String(x.titulo ?? ""),
      descripcion: (x.descripcion as string | null) ?? null,
      descuento_pct: (x.descuento_pct as number | null) ?? null,
      precio_normal: (x.precio_normal as number | null) ?? null,
      precio_oferta: (x.precio_oferta as number | null) ?? null,
      imagen_url: (x.imagen_url as string | null) ?? null,
      fecha_fin: String(x.fecha_fin ?? ""),
      boosteada: Boolean(x.boosteada),
      negocio: neg ? {
        nombre: String(negObj.nombre ?? ""),
        slug: String(negObj.slug ?? ""),
        categoria_slug: String(cat.slug ?? ""),
        emoji: String(cat.emoji ?? "🏪"),
      } : null,
    };
  });

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl bg-[#F9F8F6] px-4 py-8 pb-24">
      <Link href="/" className="text-xs font-semibold text-[#8E8279] hover:text-[#1A1410]">
        ← Volver al inicio
      </Link>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-[#1A1410]">
        🔥 Ofertas de Linares
      </h1>
      <p className="mt-1 text-sm text-[#8E8279] mb-6">
        Descuentos y promociones vigentes de los negocios locales — se van rápido.
      </p>

      {ofertas.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#E8E4DE] p-8 text-center">
          <p className="text-3xl mb-2">🏷️</p>
          <p className="text-sm font-semibold text-[#1A1410]">No hay ofertas vigentes ahora mismo</p>
          <p className="text-xs text-[#8E8279] mt-1">Vuelve pronto — los negocios publican promociones cada semana.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {ofertas.map(o => {
            const url = o.negocio?.categoria_slug && o.negocio?.slug ? `/${o.negocio.categoria_slug}/${o.negocio.slug}` : "#";
            const dias = Math.ceil((new Date(o.fecha_fin).getTime() - Date.now()) / 86_400_000);
            return (
              <Link key={o.id} href={url} className="relative overflow-hidden rounded-2xl border border-[#E8E4DE] bg-white shadow-linares-sm hover:shadow-linares transition active:scale-[0.98]">
                <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-[#F9F8F6] to-[#E8E4DE]">
                  {o.imagen_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={o.imagen_url} alt={o.titulo} className="h-full w-full object-cover" />
                    : <span className="text-4xl">{o.negocio?.emoji ?? "🏪"}</span>}
                  {o.descuento_pct && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#C05A46] px-2 py-0.5 text-[10px] font-extrabold text-white">-{o.descuento_pct}%</span>
                  )}
                  {o.boosteada && (
                    <span className="absolute left-2 top-2 rounded-full bg-[#F4B860] px-1.5 py-0.5 text-[9px] font-bold text-[#1A1410]">⭐ Dest.</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-xs font-bold leading-tight text-[#1A1410]">{o.titulo}</p>
                  {o.negocio && <p className="mt-0.5 truncate text-[10px] text-[#8E8279]">{o.negocio.nombre}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    {o.precio_oferta
                      ? <div className="flex items-baseline gap-1">
                          <span className="text-sm font-extrabold text-[#C05A46]">${o.precio_oferta.toLocaleString("es-CL")}</span>
                          {o.precio_normal && <span className="text-[9px] text-[#8E8279] line-through">${o.precio_normal.toLocaleString("es-CL")}</span>}
                        </div>
                      : <span className="text-[10px] text-[#8E8279]">Ver oferta →</span>}
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${dias <= 1 ? "bg-[#C05A46]/10 text-[#C05A46]" : "bg-[#F9F8F6] text-[#8E8279]"}`}>
                      {dias <= 0 ? "Hoy" : dias === 1 ? "1d" : `${dias}d`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#1f5268] to-[#2B6E80] p-5 text-center">
        <p className="text-sm font-bold text-white">¿Tienes un negocio en Linares?</p>
        <p className="mt-1 text-xs text-white/70">Publica tus ofertas y llega a más vecinos.</p>
        <Link href="/premium" className="mt-3 inline-block rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-[#2B6E80] active:scale-95 transition">
          Conocer plan Premium →
        </Link>
      </div>
    </main>
  );
}
