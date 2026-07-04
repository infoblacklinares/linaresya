import Link from "next/link";
import { supabase } from "@/lib/supabase";
import JsonLd from "@/components/JsonLd";
import FavoritoButton from "@/components/FavoritoButton";
import Hero from "@/components/Hero";
import LinaresEsencial from "@/components/LinaresEsencial";
import AdvertisementBanner from "@/components/AdvertisementBanner";
import NewsletterForm from "@/components/NewsletterForm";
import FadeInSection from "@/components/FadeInSection";
import AnimatedCard from "@/components/AnimatedCard";
import NudgeArrow from "@/components/NudgeArrow";
import StoriesBar, { type Historia } from "@/components/StoriesBar";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { getOpenIds, estaAbierto, badgeAbierto } from "@/lib/horarios";
import { getRecentPosts } from "@/lib/blog-posts";

// Sin esto, Next.js cachea la página estáticamente y "Destacados" muestra
// siempre el mismo resultado del build en vez de una selección al azar.
export const revalidate = 0;

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  emoji: string;
  descripcion: string | null;
  activa: boolean;
  orden: number;
};

type NegocioCard = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  plan: "basico" | "premium";
  verificado: boolean;
  foto_portada: string | null;
  a_domicilio: boolean;
  zona_cobertura: string | null;
  creado_en?: string;
  telefono: string | null;
  categorias: { nombre: string; slug: string; emoji: string } | null;
};

type ResenaHome = {
  id: number;
  autor_nombre: string;
  estrellas: number;
  comentario: string | null;
  negocio_id: string;
  negocioNombre: string;
  negocioSlug: string;
  categoriaSlug: string;
  categoriaEmoji: string;
};

type OfertaHome = {
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;
function esNuevo(creado_en?: string) {
  if (!creado_en) return false;
  return Date.now() - new Date(creado_en).getTime() < SIETE_DIAS_MS;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeCategoria(raw: unknown): NegocioCard["categorias"] {
  const x = Array.isArray(raw) ? raw[0] : raw;
  if (!x || typeof x !== "object") return null;
  return {
    nombre: String((x as Record<string, unknown>).nombre ?? ""),
    slug:   String((x as Record<string, unknown>).slug   ?? ""),
    emoji:  String((x as Record<string, unknown>).emoji  ?? ""),
  };
}

function toNegocio(r: unknown): NegocioCard {
  const x = r as Record<string, unknown>;
  return {
    id:             String(x.id ?? ""),
    nombre:         String(x.nombre ?? ""),
    slug:           String(x.slug ?? ""),
    descripcion:    (x.descripcion as string | null) ?? null,
    plan:           (x.plan as "basico" | "premium") ?? "basico",
    verificado:     Boolean(x.verificado),
    foto_portada:   (x.foto_portada as string | null) ?? null,
    a_domicilio:    Boolean(x.a_domicilio),
    zona_cobertura: (x.zona_cobertura as string | null) ?? null,
    creado_en:      (x.creado_en as string | undefined) ?? undefined,
    telefono:       (x.telefono as string | null) ?? null,
    categorias:     normalizeCategoria(x.categorias),
  };
}

// Paleta Linares Conectado para categorías
const CAT_COLORS = [
  "bg-[#2B6E80]/8 text-[#2B6E80]",
  "bg-[#C05A46]/8 text-[#C05A46]",
  "bg-[#3D5A45]/8 text-[#3D5A45]",
  "bg-[#8E8279]/10 text-[#8E8279]",
  "bg-[#F4B860]/15 text-[#8B5E0A]",
  "bg-[#2B6E80]/12 text-[#1f5268]",
  "bg-[#C05A46]/10 text-[#a84d3a]",
  "bg-[#3D5A45]/10 text-[#314233]",
  "bg-[#2B6E80]/6 text-[#2B6E80]",
  "bg-[#C05A46]/6 text-[#C05A46]",
  "bg-[#3D5A45]/6 text-[#3D5A45]",
  "bg-[#8E8279]/8 text-[#8E8279]",
];
const catColor = (i: number) => CAT_COLORS[i % CAT_COLORS.length];

// Alturas variadas estilo Pinterest para el masonry
const MASONRY_ASPECTS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[4/3]"];
const masonryAspect = (i: number) => MASONRY_ASPECTS[i % MASONRY_ASPECTS.length];

// ── Página ────────────────────────────────────────────────────────────────────
export default async function Home() {
  const hoy = new Date().toISOString().split("T")[0];

  const [
    { data: categorias, error },
    { data: destacadosData },
    { data: recientesData },
    { data: ofertasData },
    { count: totalCount },
    { data: resenasRecientesData },
    { data: historiasData },
  ] = await Promise.all([
    supabase.from("categorias").select("*").order("orden"),

    supabase
      .from("negocios")
      .select("id, nombre, slug, descripcion, plan, verificado, foto_portada, a_domicilio, zona_cobertura, creado_en, telefono, categorias:categoria_id(nombre, slug, emoji)")
      .eq("activo", true)
      .order("plan",      { ascending: false })
      .order("verificado",{ ascending: false })
      .order("creado_en", { ascending: false })
      .limit(24),

    supabase
      .from("negocios")
      .select("id, nombre, slug, descripcion, plan, verificado, foto_portada, a_domicilio, zona_cobertura, creado_en, telefono, categorias:categoria_id(nombre, slug, emoji)")
      .eq("activo", true)
      .order("creado_en", { ascending: false })
      .limit(6),

    supabase
      .from("ofertas")
      .select("id, titulo, descripcion, descuento_pct, precio_normal, precio_oferta, imagen_url, fecha_fin, boosteada, negocios:negocio_id(nombre, slug, categorias:categoria_id(slug, emoji))")
      .eq("activa", true)
      .gte("fecha_fin", hoy)
      .order("boosteada",   { ascending: false })
      .order("boost_orden", { ascending: false })
      .limit(10),

    supabase.from("negocios").select("id", { count: "exact", head: true }).eq("activo", true),

    // Últimas reseñas aprobadas con comentario para la sección de prueba social
    supabase
      .from("resenas")
      .select("id, autor_nombre, estrellas, comentario, negocio_id, negocios:negocio_id(nombre, slug, categorias:categoria_id(slug, emoji))")
      .eq("aprobada", true)
      .not("comentario", "is", null)
      .order("creado_en", { ascending: false })
      .limit(6),

    // Historias vigentes de negocios premium (RLS filtra expiradas igual)
    supabase
      .from("historias")
      .select("id, imagen_url, texto, negocio_id, negocios:negocio_id(nombre, foto_portada, plan, activo, slug, categorias:categoria_id(slug, emoji))")
      .gt("expira_en", new Date().toISOString())
      .order("creada_en", { ascending: false })
      .limit(30),
  ]);

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="rounded-2xl bg-white p-8 text-center shadow-linares">
          <p className="font-semibold text-[#1A1410]">Error conectando con la base de datos</p>
          <p className="mt-1 text-sm text-[#8E8279]">Revisa las variables de entorno.</p>
        </div>
      </main>
    );
  }

  const cats           = (categorias ?? []) as Categoria[];
  const destacadosPool = ((destacadosData ?? []) as unknown[]).map(toNegocio);
  // Pool de hasta 24 premium/verificados/recientes — se elige un grupo al azar
  // de 6 en cada visita para que la sección no muestre siempre lo mismo.
  const destacados     = shuffle(destacadosPool).slice(0, 6);
  const recientes  = ((recientesData  ?? []) as unknown[])
    .map(toNegocio)
    .filter(r => !destacados.some(d => d.id === r.id))
    .slice(0, 4);

  const ofertas: OfertaHome[] = ((ofertasData ?? []) as unknown[]).map(r => {
    const x   = r as Record<string, unknown>;
    const neg = Array.isArray(x.negocios) ? x.negocios[0] : x.negocios;
    const negObj = neg as Record<string, unknown>;
    const cat = neg && typeof neg === "object"
      ? (Array.isArray(negObj.categorias)
          ? (negObj.categorias as unknown[])[0]
          : negObj.categorias)
      : null;
    return {
      id:            Number(x.id),
      titulo:        String(x.titulo ?? ""),
      descripcion:   (x.descripcion as string | null) ?? null,
      descuento_pct: (x.descuento_pct as number | null) ?? null,
      precio_normal: (x.precio_normal as number | null) ?? null,
      precio_oferta: (x.precio_oferta as number | null) ?? null,
      imagen_url:    (x.imagen_url as string | null) ?? null,
      fecha_fin:     String(x.fecha_fin ?? ""),
      boosteada:     Boolean(x.boosteada),
      negocio: neg && typeof neg === "object" ? {
        nombre:        String((neg as Record<string, unknown>).nombre ?? ""),
        slug:          String((neg as Record<string, unknown>).slug   ?? ""),
        categoria_slug: cat && typeof cat === "object" ? String((cat as Record<string, unknown>).slug ?? "") : "",
        emoji:          cat && typeof cat === "object" ? String((cat as Record<string, unknown>).emoji ?? "") : "🏪",
      } : null,
    };
  });

  // Parsear reseñas recientes para la sección de prueba social
  const resenasRecientes: ResenaHome[] = ((resenasRecientesData ?? []) as unknown[]).flatMap(r => {
    const x = r as Record<string, unknown>;
    const neg = Array.isArray(x.negocios) ? (x.negocios as unknown[])[0] : x.negocios;
    if (!neg || typeof neg !== "object") return [];
    const negObj = neg as Record<string, unknown>;
    const catRaw = Array.isArray(negObj.categorias) ? (negObj.categorias as unknown[])[0] : negObj.categorias;
    const cat = catRaw && typeof catRaw === "object" ? catRaw as Record<string, unknown> : null;
    const comentario = (x.comentario as string | null) ?? null;
    if (!comentario || comentario.length < 10) return []; // omitir sin contenido
    return [{
      id: Number(x.id),
      autor_nombre: String(x.autor_nombre ?? ""),
      estrellas: Number(x.estrellas ?? 5),
      comentario,
      negocio_id: String(x.negocio_id ?? ""),
      negocioNombre: String(negObj.nombre ?? ""),
      negocioSlug: String(negObj.slug ?? ""),
      categoriaSlug: cat ? String(cat.slug ?? "") : "",
      categoriaEmoji: cat ? String(cat.emoji ?? "🏪") : "🏪",
    }];
  }).slice(0, 3);

  // Historias premium para la barra tipo Instagram
  const historias: Historia[] = ((historiasData ?? []) as unknown[]).flatMap(r => {
    const x = r as Record<string, unknown>;
    const neg = Array.isArray(x.negocios) ? (x.negocios as unknown[])[0] : x.negocios;
    if (!neg || typeof neg !== "object") return [];
    const n = neg as Record<string, unknown>;
    if (!n.activo) return [];
    const catRaw = Array.isArray(n.categorias) ? (n.categorias as unknown[])[0] : n.categorias;
    const cat = catRaw && typeof catRaw === "object" ? catRaw as Record<string, unknown> : null;
    return [{
      id: Number(x.id),
      imagen_url: String(x.imagen_url ?? ""),
      texto: (x.texto as string | null) ?? null,
      negocio_id: String(x.negocio_id ?? ""),
      nombre: String(n.nombre ?? ""),
      emoji: cat ? String(cat.emoji ?? "🏪") : "🏪",
      foto_portada: (n.foto_portada as string | null) ?? null,
      url: cat ? `/${String(cat.slug)}/${String(n.slug)}` : "#",
    }];
  });

  // Ratings para negocios en Destacados (batch query + agrega en JS)
  type ResenaRating = { negocio_id: string; estrellas: number };
  const ratingsMap = new Map<string, { sum: number; count: number }>();
  const allDisplayIds = [...destacados, ...recientes].map(n => n.id);
  if (allDisplayIds.length > 0) {
    const { data: ratingsData } = await supabase
      .from("resenas")
      .select("negocio_id, estrellas")
      .in("negocio_id", allDisplayIds)
      .eq("aprobada", true);
    for (const row of ((ratingsData ?? []) as ResenaRating[])) {
      const prev = ratingsMap.get(row.negocio_id) ?? { sum: 0, count: 0 };
      ratingsMap.set(row.negocio_id, { sum: prev.sum + row.estrellas, count: prev.count + 1 });
    }
  }

  const primerPremium = destacados.find(d => d.plan === "premium");
  const bannerNegocio = primerPremium ? {
    nombre:        primerPremium.nombre,
    slug:          primerPremium.slug,
    categoria_slug: primerPremium.categorias?.slug ?? "",
    descripcion:   primerPremium.descripcion,
    emoji:         primerPremium.categorias?.emoji ?? "🏪",
  } : undefined;

  const totalNegocios = totalCount ?? destacados.length;

  // ── Horarios: qué negocios están abiertos ahora ───────────────────────────
  const todosIds = [...destacados, ...recientes].map(n => n.id);
  const openIdsArr = await getOpenIds(todosIds);
  const openIds    = new Set(openIdsArr);

  // Negocios abiertos ahora (para la sección "Abiertos ahora")
  const negociosAbiertos = [...destacados, ...recientes]
    .filter(n => openIds.has(n.id))
    .slice(0, 8);
  const abiertosCount = negociosAbiertos.length;

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl bg-[#F9F8F6]">
      <JsonLd id="ld-organization" data={organizationJsonLd()} />
      <JsonLd id="ld-website"      data={websiteJsonLd()} />

      {/* Hero */}
      <Hero totalNegocios={totalNegocios} abiertosAhora={abiertosCount} />

      {/* Historias premium — estilo Instagram */}
      <StoriesBar historias={historias} />

      {/* Filtros rápidos — estilo Uber Eats */}
      <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-2 no-scrollbar">
        {[
          { label: "Todos",         icon: "🏠", href: "/buscar" },
          { label: "Abierto ahora", icon: "🟢", href: "/buscar?abierto=1" },
          { label: "Premium",       icon: "⭐", href: "/buscar?premium=1" },
          { label: "Verificados",   icon: "✓",  href: "/buscar?verificado=1" },
          { label: "A domicilio",   icon: "🛵", href: "/buscar?domicilio=1" },
        ].map((f, i) => (
          <Link
            key={f.href}
            href={f.href}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition flex items-center gap-1.5 ${
              i === 0
                ? "bg-[#1A1410] text-white shadow-sm"
                : "border border-[#E8E4DE] bg-white text-[#1A1410] hover:border-[#1A1410]/30"
            }`}
          >
            <span className="text-base leading-none">{f.icon}</span>
            {f.label}
          </Link>
        ))}
      </div>

      {/* Farmacia de turno — acceso rápido */}
      <div className="px-4 pt-4">
        <Link
          href="/farmacia-turno"
          className="flex items-center gap-3 rounded-2xl bg-white border border-[#E8E4DE] px-4 py-3 hover:border-[#2B6E80]/40 transition group"
        >
          <span className="h-10 w-10 rounded-xl bg-[#2B6E80]/8 flex items-center justify-center text-xl shrink-0">💊</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1A1410]">Farmacia de turno hoy</p>
            <p className="text-xs text-muted-foreground truncate">¿Cuál está abierta las 24 horas?</p>
          </div>
          <svg className="text-muted-foreground group-hover:text-[#2B6E80] transition shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>

      {/* Linares Esencial */}
      <LinaresEsencial />

      {/* Abiertos ahora — glassmorphism */}
      {negociosAbiertos.length > 0 && (
        <section className="pt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <h2 className="text-xl font-black text-[#1A1410]">Abiertos ahora</h2>
            </div>
            <Link href="/buscar?abierto=1" className="text-xs font-bold text-[#2B6E80]">Ver todos <NudgeArrow /></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
            {negociosAbiertos.map(n => {
              const url = n.categorias ? `/${n.categorias.slug}/${n.slug}` : "#";
              return (
                <div key={n.id} className="shrink-0 w-44 overflow-hidden rounded-2xl bg-white shadow-[0_2px_14px_rgba(0,0,0,0.08)] border border-[#F0EDE8]">
                  <Link href={url} className="block p-3 pb-2">
                    <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-700">Abierto</span>
                    </div>
                    <p className="text-sm font-bold text-[#1A1410] truncate leading-tight">{n.nombre}</p>
                    <p className="text-[10px] text-[#8E8279] mt-0.5 truncate">
                      {n.categorias?.emoji} {n.categorias?.nombre}
                    </p>
                  </Link>
                  {n.telefono ? (
                    <a
                      href={`tel:${n.telefono}`}
                      className="flex items-center justify-center gap-1.5 border-t border-[#F5F2EE] py-2.5 text-[11px] font-bold text-[#2B6E80] hover:bg-[#F5F2EE] transition"
                    >
                      📞 Llamar
                    </a>
                  ) : (
                    <Link
                      href={url}
                      className="flex items-center justify-center gap-1 border-t border-[#F5F2EE] py-2.5 text-[11px] font-bold text-[#2B6E80] hover:bg-[#F5F2EE] transition"
                    >
                      Ver ficha →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categorías — iconos grandes estilo Uber Eats */}
      <section className="pt-6">
        <div className="flex items-end justify-between px-4 mb-4">
          <h2 className="text-xl font-black tracking-tight text-[#1A1410]">¿Qué necesitas?</h2>
          <Link href="/buscar" className="text-xs font-bold text-[#2B6E80]">Ver todas <NudgeArrow /></Link>
        </div>
        <div className="flex gap-4 overflow-x-auto px-4 pb-3 no-scrollbar">
          {cats.map((cat, i) => (
            <AnimatedCard key={cat.id} index={i} className="shrink-0">
              <Link href={`/${cat.slug}`} className="flex flex-col items-center gap-2 group">
                <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-white text-[2rem] shadow-[0_2px_14px_rgba(0,0,0,0.09)] border border-[#F0EDE8] transition group-hover:-translate-y-1 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.13)] active:scale-90">
                  {cat.emoji}
                  {i === cats.length - 1 && (
                    <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[#C05A46] px-1.5 py-0.5 text-[8px] font-bold text-white shadow-sm">New</span>
                  )}
                </div>
                <span className="w-[72px] text-center text-[11px] font-semibold leading-tight text-[#6B5E57]">{cat.nombre}</span>
              </Link>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Banner publicitario */}
      <AdvertisementBanner negocio={bannerNegocio} fallbackCta={!bannerNegocio} />

      {/* Ofertas activas */}
      {ofertas.length > 0 && (
        <section className="pt-7">
        <FadeInSection>
          <div className="flex items-center justify-between px-4 mb-3">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[#1A1410]">Ofertas activas</h2>
              <p className="text-xs text-[#8E8279]">Promociones vigentes hoy en Linares</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-[#C05A46]/10 px-2.5 py-1 text-xs font-bold text-[#C05A46]">
              🔥 {ofertas.length}
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
            {ofertas.map(o => {
              const url  = o.negocio?.categoria_slug && o.negocio?.slug ? `/${o.negocio.categoria_slug}/${o.negocio.slug}` : "#";
              const dias = Math.ceil((new Date(o.fecha_fin).getTime() - Date.now()) / 86_400_000);
              return (
                <Link key={o.id} href={url} className="relative w-48 shrink-0 overflow-hidden rounded-2xl border border-[#E8E4DE] bg-white shadow-linares-sm hover:shadow-linares transition">
                  <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-[#F9F8F6] to-[#E8E4DE]">
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
        </FadeInSection>
        </section>
      )}

      {/* Destacados — grid 2 columnas */}
      {destacados.length > 0 && (
        <section className="pt-8">
          <div className="flex items-end justify-between px-4 mb-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#1A1410]">Destacados</h2>
              <p className="text-xs text-[#8E8279]">Premium y verificados por la comunidad</p>
            </div>
            <Link href="/buscar" className="text-xs font-bold text-[#2B6E80]">Ver todo <NudgeArrow /></Link>
          </div>
          <div className="columns-2 gap-3 px-4">
            {destacados.map((d, i) => {
              const url = d.categorias ? `/${d.categorias.slug}/${d.slug}` : "#";
              const rating = ratingsMap.get(d.id);
              const isOpen = estaAbierto(d.id, openIds);
              return (
                <AnimatedCard key={d.id} index={i} className="mb-3 break-inside-avoid">
                <Link
                  href={url}
                  className="group block overflow-hidden rounded-3xl bg-white shadow-[0_2px_14px_rgba(0,0,0,0.08)] border border-[#F0EDE8] transition hover:shadow-[0_6px_22px_rgba(0,0,0,0.12)] active:scale-[0.98]"
                >
                  {/* Imagen */}
                  <div className={`relative w-full ${masonryAspect(i)} overflow-hidden flex items-center justify-center text-5xl ${catColor(i)}`}>
                    {d.foto_portada
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={d.foto_portada} alt={d.nombre} className="absolute inset-0 h-full w-full object-cover" />
                      : <span>{d.categorias?.emoji ?? "📍"}</span>}
                    {/* Badge premium sobre imagen */}
                    {d.plan === "premium" && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#F4B860] px-2 py-0.5 text-[9px] font-extrabold text-[#1A1410] shadow-sm">⭐ Premium</span>
                    )}
                    {/* Badge abierto/cerrado */}
                    <span className={`absolute right-2 bottom-2 rounded-full px-2 py-0.5 text-[9px] font-bold backdrop-blur-sm ${badgeAbierto(isOpen).clases}`}>
                      {badgeAbierto(isOpen).texto}
                    </span>
                    {/* Favorito */}
                    <div className="absolute left-2 bottom-2">
                      <FavoritoButton negocioId={d.id} variant="icon" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="truncate text-sm font-black text-[#1A1410] leading-tight">{d.nombre}</p>
                    <p className="mt-0.5 truncate text-[10px] text-[#8E8279]">
                      {d.categorias?.emoji} {d.categorias?.nombre}{d.a_domicilio ? " · 🛵" : ""}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      {d.verificado && (
                        <span className="rounded-full bg-[#2B6E80]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#2B6E80]">✓ Verif.</span>
                      )}
                      {esNuevo(d.creado_en) && (
                        <span className="rounded-full bg-[#3D5A45]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#3D5A45]">Nuevo</span>
                      )}
                      {rating && rating.count > 0 && (
                        <span className="text-[10px] font-bold text-amber-500">
                          ★ {(rating.sum / rating.count).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                </AnimatedCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Recién sumados — grid imagen-first */}
      {recientes.length > 0 && (
        <section className="pt-8">
          <div className="flex items-end justify-between px-4 mb-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#1A1410]">Recién sumados</h2>
              <p className="text-xs text-[#8E8279]">Los últimos en unirse a LinaresYa</p>
            </div>
          </div>
          <div className="columns-2 gap-3 px-4">
            {recientes.map((d, i) => {
              const url = d.categorias ? `/${d.categorias.slug}/${d.slug}` : "#";
              return (
                <AnimatedCard key={d.id} index={i} className="mb-3 break-inside-avoid">
                <Link href={url} className="block overflow-hidden rounded-3xl bg-white shadow-[0_2px_14px_rgba(0,0,0,0.08)] border border-[#F0EDE8] transition hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] active:scale-[0.98]">
                  <div className={`relative w-full ${masonryAspect(i + 1)} overflow-hidden flex items-center justify-center text-5xl ${catColor(i + 4)}`}>
                    {d.foto_portada
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={d.foto_portada} alt={d.nombre} className="absolute inset-0 h-full w-full object-cover" />
                      : <span>{d.categorias?.emoji ?? "📍"}</span>}
                    {esNuevo(d.creado_en) && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#1A1410] px-2 py-0.5 text-[9px] font-bold text-white">Nuevo</span>
                    )}
                    {/* Estado abierto badge en imagen */}
                    {(() => {
                      const b = badgeAbierto(estaAbierto(d.id, openIds));
                      return (
                        <span className={`absolute right-2 bottom-2 rounded-full px-2 py-0.5 text-[9px] font-bold backdrop-blur-sm ${b.clases}`}>
                          {b.texto}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-black text-[#1A1410]">{d.nombre}</p>
                    <p className="mt-0.5 truncate text-[10px] text-[#8E8279]">{d.categorias?.emoji} {d.categorias?.nombre}</p>
                  </div>
                </Link>
                </AnimatedCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Reseñas recientes — prueba social */}
      {resenasRecientes.length > 0 && (
        <section className="pt-8 px-4">
          <div className="mb-3">
            <h2 className="text-xl font-black tracking-tight text-[#1A1410]">Lo que dicen los vecinos</h2>
            <p className="text-xs text-[#8E8279]">Reseñas reales de clientes de Linares</p>
          </div>
          <div className="space-y-3">
            {resenasRecientes.map((r, i) => {
              const fichaUrl = r.categoriaSlug && r.negocioSlug ? `/${r.categoriaSlug}/${r.negocioSlug}` : null;
              return (
                <AnimatedCard key={r.id} index={i}>
                <div className="rounded-2xl bg-white shadow-linares-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1A1410] truncate">{r.autor_nombre}</p>
                      {fichaUrl ? (
                        <Link href={fichaUrl} className="text-[11px] text-[#2B6E80] font-medium hover:underline truncate block">
                          {r.categoriaEmoji} {r.negocioNombre}
                        </Link>
                      ) : (
                        <p className="text-[11px] text-[#8E8279] truncate">{r.categoriaEmoji} {r.negocioNombre}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-amber-500 font-bold text-sm tracking-tight">
                      {"★".repeat(Math.min(5, r.estrellas))}<span className="text-[#E8E4DE]">{"★".repeat(5 - Math.min(5, r.estrellas))}</span>
                    </span>
                  </div>
                  <p className="text-[13px] text-[#475569] leading-relaxed line-clamp-3 italic">
                    &ldquo;{r.comentario}&rdquo;
                  </p>
                </div>
                </AnimatedCard>
              );
            })}
          </div>
          <Link href="/buscar" className="mt-3 block text-center text-xs font-semibold text-[#2B6E80]">
            Ver todos los negocios <NudgeArrow />
          </Link>
        </section>
      )}

      {/* Newsletter */}
      <section className="px-4 pt-8">
        <FadeInSection className="rounded-3xl bg-gradient-to-br from-[#1f5268] to-[#2B6E80] p-5">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white/90">
            📬 Novedades de Linares
          </div>
          <h2 className="mt-2 text-lg font-extrabold text-white leading-tight">
            Enterate primero de<br />ofertas y negocios nuevos
          </h2>
          <p className="mt-1 mb-4 text-sm text-white/70">
            Un resumen semanal de lo mejor en Linares, directo a tu email.
          </p>
          <NewsletterForm />
        </FadeInSection>
      </section>

      {/* Grid completo de categorías */}
      <section className="pb-24 pt-10">
        <div className="px-4 mb-3">
          <h2 className="text-xl font-black tracking-tight text-[#1A1410]">Todas las categorías</h2>
          <p className="text-xs text-[#8E8279]">{cats.length} categorías cubriendo todo Linares.</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 px-4">
          {cats.map((cat, i) => (
            <li key={cat.id}>
              <AnimatedCard index={i % 8}>
                <Link href={`/${cat.slug}`} className={`flex items-center gap-3 rounded-2xl p-4 shadow-linares-sm transition hover:shadow-linares ${catColor(i)}`}>
                  <span className="text-2xl">{cat.emoji}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{cat.nombre}</p>
                    <p className="text-[10px] opacity-60">/{cat.slug}</p>
                  </div>
                </Link>
              </AnimatedCard>
            </li>
          ))}
        </ul>
      </section>

      {/* Blog — guías locales (dinámico) */}
      {(() => {
        const recentBlog = getRecentPosts(3);
        return (
          <section className="px-4 pt-8 pb-4">
            <div className="flex items-end justify-between mb-3">
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-[#1A1410]">Guías de Linares</h2>
                <p className="text-xs text-[#8E8279]">Artículos útiles para vecinos</p>
              </div>
              <Link href="/blog" className="text-xs font-semibold text-[#2B6E80]">Ver todo <NudgeArrow /></Link>
            </div>
            <div className="space-y-2">
              {recentBlog.map((art) => (
                <Link
                  key={art.slug}
                  href={`/blog/${art.slug}`}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-linares-sm hover:shadow-linares transition-shadow"
                >
                  <span className="text-xl">{art.emoji}</span>
                  <span className="text-sm font-semibold text-[#1A1410] line-clamp-1">{art.titulo}</span>
                  <span className="ml-auto text-[#8E8279] text-xs shrink-0">→</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E4DE] bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-4 px-2 py-2">
          <NavItem icon={<HomeIcon />}   label="Inicio"    href="/"          active />
          <NavItem icon={<SearchIcon />} label="Buscar"    href="/buscar" />
          <NavItem icon={<HeartIcon />}  label="Favoritos" href="/favoritos" />
          <NavItem icon={<PlusIcon />}   label="Publicar"  href="/publicar" />
        </div>
      </nav>
    </main>
  );
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-0.5 py-1.5 ${active ? "text-[#2B6E80]" : "text-[#8E8279]"}`}>
      <span className={active ? "scale-110" : ""}>{icon}</span>
      <span className="text-[10px] font-semibold">{label}</span>
    </Link>
  );
}

function HomeIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z" /></svg>; }
function SearchIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>; }
function HeartIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>; }
function PlusIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>; }
