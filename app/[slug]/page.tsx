import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
import { getOpenIds, estaAbierto } from "@/lib/horarios";
import AnimatedCard from "@/components/AnimatedCard";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.vercel.app";

type Categoria = { id: number; nombre: string; slug: string; emoji: string; descripcion: string | null };
type Negocio = {
  id: string; nombre: string; slug: string; descripcion: string | null;
  tipo: "negocio" | "independiente"; plan: "basico" | "premium";
  verificado: boolean; telefono: string | null; whatsapp: string | null;
  direccion: string | null; a_domicilio: boolean; foto_portada: string | null;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase.from("categorias").select("nombre,slug,descripcion,emoji").eq("slug", slug).eq("activa", true).single();
  if (!data) return { title: "Categoría no encontrada" };
  const c = data as { nombre: string; slug: string; descripcion: string | null; emoji: string };
  const titulo = `${c.nombre} en Linares`;
  const descripcion = (c.descripcion ?? `Encuentra ${c.nombre.toLowerCase()} en Linares. Contacto directo, horarios, ubicación y más en LinaresYa.`).slice(0, 160);
  const url = `${SITE_URL}/${c.slug}`;
  return {
    title: titulo, description: descripcion,
    alternates: { canonical: url },
    openGraph: { type: "website", locale: "es_CL", url, siteName: "LinaresYa", title: titulo, description: descripcion },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion },
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const filtroPremium   = sp.premium   === "1";
  const filtroVerif     = sp.verificado === "1";
  const filtroAbierto   = sp.abierto    === "1";
  const filtroDomicilio = sp.domicilio  === "1";
  const filtroOrden     = sp.orden === "rating" ? "rating" : "relevancia";

  const { data: categoria, error: catError } = await supabase.from("categorias").select("*").eq("slug", slug).eq("activa", true).single();
  if (catError || !categoria) notFound();
  const cat = categoria as Categoria;

  let query = supabase
    .from("negocios")
    .select("id,nombre,slug,descripcion,tipo,plan,verificado,telefono,whatsapp,direccion,a_domicilio,foto_portada")
    .eq("categoria_id", cat.id).eq("activo", true);

  if (filtroPremium)   query = query.eq("plan", "premium");
  if (filtroVerif)     query = query.eq("verificado", true);
  if (filtroDomicilio) query = query.eq("a_domicilio", true);

  query = query.order("plan", { ascending: false }).order("verificado", { ascending: false }).order("nombre", { ascending: true });

  const { data: negocios } = await query;
  let items = (negocios ?? []) as Negocio[];

  type ResenaRating = { negocio_id: string; estrellas: number };
  const ratingsMap = new Map<string, { sum: number; count: number }>();
  if (items.length > 0) {
    const { data: resenasData } = await supabase.from("resenas").select("negocio_id, estrellas").in("negocio_id", items.map(n => n.id)).eq("aprobada", true);
    for (const r of ((resenasData ?? []) as ResenaRating[])) {
      const prev = ratingsMap.get(r.negocio_id) ?? { sum: 0, count: 0 };
      ratingsMap.set(r.negocio_id, { sum: prev.sum + r.estrellas, count: prev.count + 1 });
    }
  }

  const openIds = new Set(await getOpenIds(items.map(n => n.id)));

  // Filtro "abierto ahora" (post-query porque viene de tabla horarios)
  if (filtroAbierto) items = items.filter(n => openIds.has(n.id));

  // Orden por rating
  if (filtroOrden === "rating") {
    items = [...items].sort((a, b) => {
      const ra = ratingsMap.get(a.id);
      const rb = ratingsMap.get(b.id);
      const avgA = ra ? ra.sum / ra.count : 0;
      const avgB = rb ? rb.sum / rb.count : 0;
      return avgB - avgA;
    });
  }

  const breadcrumbData = breadcrumbJsonLd([{ name: "Inicio", url: SITE_URL }, { name: cat.nombre, url: `${SITE_URL}/${cat.slug}` }]);
  const itemListData = itemListJsonLd(items.map(n => ({ nombre: n.nombre, slug: n.slug })), cat.slug);

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl lg:max-w-6xl bg-[#F9F8F6]">
      <JsonLd id="ld-breadcrumb" data={breadcrumbData} />
      <JsonLd id="ld-itemlist" data={itemListData} />

      {/* ── Hero con gradiente ───────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a4a5a] via-[#2B6E80] to-[#1e3a4a]">
        {/* Orbs */}
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-10 h-32 w-32 rounded-full bg-[#F4B860]/15 blur-2xl pointer-events-none" />

        {/* Header glass */}
        <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/10">
          <div className="px-4 py-3 flex items-center gap-3">
            <Link href="/" aria-label="Volver"
              className="h-9 w-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/25 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Categoría</p>
              <h1 className="text-base font-extrabold tracking-tight text-white truncate">{cat.emoji} {cat.nombre}</h1>
            </div>
            <span className="text-xs font-bold text-white/60 shrink-0 bg-white/10 rounded-full px-2.5 py-1">
              {items.length}
            </span>
          </div>
        </header>

        {/* Descripción */}
        {cat.descripcion && (
          <p className="px-5 pt-3 pb-1 text-sm text-white/65 leading-relaxed">{cat.descripcion}</p>
        )}

        {/* Filtros glass */}
        <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-4 no-scrollbar">
          {[
            { label: "Todos",             href: `/${cat.slug}`,                        activo: !filtroPremium && !filtroVerif && !filtroAbierto && !filtroDomicilio && filtroOrden === "relevancia" },
            { label: "🟢 Abierto ahora",  href: `/${cat.slug}?abierto=1`,              activo: filtroAbierto },
            { label: "⭐ Premium",         href: `/${cat.slug}?premium=1`,              activo: filtroPremium },
            { label: "🛵 A domicilio",    href: `/${cat.slug}?domicilio=1`,            activo: filtroDomicilio },
            { label: "✓ Verificados",     href: `/${cat.slug}?verificado=1`,           activo: filtroVerif },
            { label: "★ Mejor valorados", href: `/${cat.slug}?orden=rating`,           activo: filtroOrden === "rating" },
          ].map((f) => (
            <Link key={f.href} href={f.href}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-bold transition ${
                f.activo
                  ? "bg-white text-[#2B6E80] shadow-sm"
                  : "bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25"
              }`}>
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Grid de negocios ────────────────────────────────────────── */}
      <section className="p-4 pb-8">
        {items.length === 0 ? (
          <EmptyState emoji={cat.emoji} nombre={cat.nombre} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {items.map((n, i) => {
              const rData = ratingsMap.get(n.id);
              const rating = rData && rData.count > 0 ? { avg: rData.sum / rData.count, count: rData.count } : null;
              return (
                <AnimatedCard key={n.id} index={i}>
                  <NegocioCard n={n} categoriaSlug={cat.slug} isOpen={estaAbierto(n.id, openIds)} rating={rating} />
                </AnimatedCard>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function NegocioCard({
  n, categoriaSlug, isOpen, rating,
}: {
  n: Negocio; categoriaSlug: string; isOpen: boolean; rating?: { avg: number; count: number } | null;
}) {
  const esPremium = n.plan === "premium";
  const waNumber = n.whatsapp?.replace(/\D/g, "");

  return (
    <div className="relative rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all group">

      {/* Link de fondo */}
      <Link href={`/${categoriaSlug}/${n.slug}`} className="absolute inset-0 z-10" aria-label={n.nombre} />

      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EDE8]">
        {n.foto_portada ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.foto_portada} alt={n.nombre} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-4xl opacity-30">🏪</div>
        )}

        {/* Overlay gradient abajo */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Badges sobre imagen */}
        <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border ${
            isOpen
              ? "bg-emerald-500/80 text-white border-emerald-400/40"
              : "bg-black/50 text-white/80 border-white/10"
          }`}>
            {isOpen ? "● Abierto" : "● Cerrado"}
          </span>
        </div>

        {/* Premium badge */}
        {esPremium && (
          <div className="absolute top-2 right-2">
            <span className="text-[9px] font-bold bg-[#F4B860] text-[#1A1410] px-1.5 py-0.5 rounded-full">⭐ Premium</span>
          </div>
        )}

        {/* Verificado */}
        {n.verificado && (
          <div className="absolute top-2 left-2">
            <span className="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center shadow">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M20 6 9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 relative z-10">
        <p className="font-bold text-[13px] text-[#1A1410] leading-tight line-clamp-1">{n.nombre}</p>

        {n.descripcion && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">{n.descripcion}</p>
        )}

        <div className="mt-2 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {rating && (
              <span className="text-[11px] font-bold text-amber-600">★ {rating.avg.toFixed(1)}</span>
            )}
            {n.a_domicilio && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">🛵</span>
            )}
          </div>

          {/* WhatsApp si premium */}
          {waNumber && esPremium ? (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
              className="relative z-20 h-7 w-7 rounded-full bg-[#25D366] flex items-center justify-center hover:bg-[#1ebe5d] transition shrink-0 shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M20.5 3.5A11 11 0 0 0 3 17l-1 5 5.2-1.4A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 20.5Z" />
              </svg>
            </a>
          ) : (
            <span className="h-6 w-6 rounded-full bg-secondary/50 flex items-center justify-center text-xs text-muted-foreground group-hover:bg-[#2B6E80] group-hover:text-white transition shrink-0">→</span>
          )}
        </div>
      </div>
    </div>
  );
}

const WA_SUGERIR = "56984272557";

function EmptyState({ emoji, nombre }: { emoji: string; nombre: string }) {
  const msg = encodeURIComponent(`Hola! Busqué ${nombre} en LinaresYa y no hay ninguno todavía. ¿Pueden agregar alguno?`);
  return (
    <div className="col-span-2 rounded-3xl border border-dashed border-border p-8 text-center">
      <div className="text-5xl mb-3">{emoji}</div>
      <h2 className="text-lg font-bold">Aún no hay negocios en {nombre}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">¿Sos el primero? Publicá gratis y aparecés acá en pocas horas.</p>
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
        <Link href="/publicar" className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background text-sm font-semibold px-5 py-2.5">
          Publicar mi negocio →
        </Link>
        <a href={`https://wa.me/${WA_SUGERIR}?text=${msg}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white text-sm font-bold px-5 py-2.5">
          Sugerí uno por WhatsApp
        </a>
      </div>
    </div>
  );
}
