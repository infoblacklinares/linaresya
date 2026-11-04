import Link from "next/link";
import { Store, Star, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import JsonLd from "@/components/JsonLd";
import FavoritoButton from "@/components/FavoritoButton";
import Hero from "@/components/Hero";
import HomeIntentNav from "@/components/HomeIntentNav";
import LinaresEsencial from "@/components/LinaresEsencial";
import AdvertisementBanner from "@/components/AdvertisementBanner";
import NewsletterForm from "@/components/NewsletterForm";
import FadeInSection from "@/components/FadeInSection";
import AnimatedCard from "@/components/AnimatedCard";
import NudgeArrow from "@/components/NudgeArrow";
import StoriesBar, { type Historia } from "@/components/StoriesBar";
import SplashHomeLeon from "@/components/SplashHomeLeon";
import MarqueeRow from "@/components/MarqueeRow";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { telLink } from "@/lib/contacto";
import { esPremium } from "@/lib/planes";
import { getOpenIdsHoy, estaAbierto, badgeAbierto } from "@/lib/horarios";
import { getRecentPosts } from "@/lib/blog-posts";
import { RUBROS } from "@/lib/rubros";

/**
 * La portada no tenia canonical. Sin el, `linaresya.cl/?utm_source=instagram`
 * —justo el link que se publica en una campana— se le puede presentar a Google
 * como una pagina distinta de `linaresya.cl/`, y la fuerza queda repartida.
 *
 * Va aca y no en el layout a proposito: en el layout lo heredarian /buscar,
 * /blog y todas las demas, que quedarian declarandose copias de la portada.
 * Eso es peor que no tener canonical.
 */
export const metadata = {
  alternates: { canonical: "/" },
};


/**
 * La portada se cachea 5 minutos.
 *
 * Estaba en `revalidate = 0`, o sea que **cada visita** obligaba a renderizarla
 * entera de nuevo contra la base: 742 KB de HTML, entre 1,4 y 2,2 segundos hasta
 * el primer byte, y hasta 6 en frio. Era, por lejos, la pagina mas lenta del
 * sitio; una pagina de rubro, que si se cachea, responde en 0,2.
 *
 * El motivo del 0 era que "Destacados" se baraja al azar y con cache quedaba
 * congelado desde el build. Con 5 minutos se sigue barajando —varias veces por
 * hora— y a cambio la portada se sirve cacheada. Nadie nota la diferencia entre
 * un orden que cambia a cada recarga y uno que cambia cada 5 minutos; todos
 * notan dos segundos de espera.
 *
 * Un negocio nuevo tarda como mucho 5 minutos en salir en la portada. Su ficha
 * y su categoria aparecen al instante, como siempre.
 */
export const revalidate = 300;

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

// ── Página ────────────────────────────────────────────────────────────────────
export default async function Home() {
  const hoy = new Date().toISOString().split("T")[0];

  const [
    { data: categorias, error },
    { data: destacadosData },
    { data: recientesData },
    { data: ofertasData },
    { count: totalCount },
    { count: verificadosCount },
    { data: resenasRecientesData },
    { data: categoriaCountsData },
    { data: eventosData },
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
      // 24 y no 60: son carruseles horizontales que nadie recorre entero, y
      // cada tarjeta de mas es una imagen mas que el telefono tiene que pedir.
      // Entre los dos carruseles se renderizaban 120 tarjetas.
      .limit(24),

    supabase
      .from("negocios")
      .select("id, nombre, slug, descripcion, plan, verificado, foto_portada, a_domicilio, zona_cobertura, creado_en, telefono, categorias:categoria_id(nombre, slug, emoji)")
      .eq("activo", true)
      .order("creado_en", { ascending: false })
      .gte("creado_en", new Date(Date.now() - 14 * 86_400_000).toISOString())
      .limit(24),

    supabase
      .from("ofertas")
      .select("id, titulo, descripcion, descuento_pct, precio_normal, precio_oferta, imagen_url, fecha_fin, boosteada, negocios:negocio_id!inner(nombre, slug, activo, categorias:categoria_id(slug, emoji))")
      .eq("activa", true)
      .eq("negocios.activo", true)
      .gte("fecha_fin", hoy)
      .order("boosteada",   { ascending: false })
      .order("boost_orden", { ascending: false })
      .limit(10),

    supabase.from("negocios").select("id", { count: "exact", head: true }).eq("activo", true),

    supabase.from("negocios").select("id", { count: "exact", head: true }).eq("activo", true).eq("verificado", true),

    // Últimas reseñas aprobadas con comentario para la sección de prueba social
    supabase
      .from("resenas")
      .select("id, autor_nombre, estrellas, comentario, negocio_id, negocios:negocio_id(nombre, slug, categorias:categoria_id(slug, emoji))")
      .eq("aprobada", true)
      .not("comentario", "is", null)
      .order("creado_en", { ascending: false })
      .limit(6),

    // Conteo de negocios activos por categoría (agregado en JS)
    supabase
      .from("negocios")
      .select("categoria_id")
      .eq("activo", true),

    // Próximos eventos (RLS filtra los terminados)
    supabase
      .from("eventos")
      .select("id, titulo, emoji, lugar, fecha_inicio, destacado")
      .order("destacado", { ascending: false })
      .order("fecha_inicio")
      .limit(5),

    // Historias vigentes de negocios premium (RLS filtra expiradas igual)
    supabase
      .from("historias")
      .select("id, imagen_url, texto, negocio_id, negocios:negocio_id(nombre, foto_portada, plan, premium_hasta, activo, slug, categorias:categoria_id(slug, emoji))")
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
  // Se muestran negocios activos en carruseles de auto-scroll.
  // Destacados: mantenemos la jerarquía Premium → verificados → resto,
  // pero rotamos dentro de cada nivel para evitar que siempre aparezcan los mismos.
  const destacadosBase = ((destacadosData ?? []) as unknown[]).map(toNegocio);
  const destacados = [
    ...shuffle(destacadosBase.filter(esPremium)),
    ...shuffle(destacadosBase.filter(n => !esPremium(n) && n.verificado)),
    ...shuffle(destacadosBase.filter(n => !esPremium(n) && !n.verificado)),
  ];
  // Nuevos en LinaresYa: solo incorporaciones de los últimos 14 días.
  const recientes = ((recientesData ?? []) as unknown[]).map(toNegocio);

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

  // Conteo de negocios activos por categoría
  const catCounts = new Map<number, number>();
  for (const row of ((categoriaCountsData ?? []) as { categoria_id: number | null }[])) {
    if (row.categoria_id !== null) {
      catCounts.set(row.categoria_id, (catCounts.get(row.categoria_id) ?? 0) + 1);
    }
  }

  // Próximos eventos para la agenda de la portada
  type EventoHome = { id: number; titulo: string; emoji: string; lugar: string; fecha_inicio: string; destacado: boolean };
  const eventos_home = (eventosData ?? []) as EventoHome[];

  // Historias premium para la barra tipo Instagram
  const historias: Historia[] = ((historiasData ?? []) as unknown[]).flatMap(r => {
    const x = r as Record<string, unknown>;
    const neg = Array.isArray(x.negocios) ? (x.negocios as unknown[])[0] : x.negocios;
    if (!neg || typeof neg !== "object") return [];
    const n = neg as Record<string, unknown>;
    if (!n.activo) return [];
    // Las historias son un beneficio Premium y hasta ahora eso dependia de que
    // el admin se acordara: la consulta traia las de cualquier negocio. Si el
    // plan vence, la historia deja de mostrarse, igual que el resto.
    if (!esPremium({ plan: (n.plan as string | null) ?? null, premium_hasta: (n.premium_hasta as string | null) ?? null })) {
      return [];
    }
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

  const primerPremium = destacados.find(d => esPremium(d));
  const bannerNegocio = primerPremium ? {
    nombre:        primerPremium.nombre,
    slug:          primerPremium.slug,
    categoria_slug: primerPremium.categorias?.slug ?? "",
    descripcion:   primerPremium.descripcion,
    emoji:         primerPremium.categorias?.emoji ?? "🏪",
  } : undefined;

  const totalNegocios = totalCount ?? destacados.length;

  // ── Descubre un negocio: rotación determinística por fecha ───────────────
  // Mismo negocio para todos durante el día, cambia solo a medianoche.
  let negocioDelDia: NegocioCard | null = null;
  if (totalNegocios > 0) {
    // eslint-disable-next-line react-hooks/purity -- Server Component: se renderiza una vez por request, leer el reloj aca es correcto
    const offset = Math.floor(Date.now() / 86_400_000) % totalNegocios;
    const { data: delDiaData } = await supabase
      .from("negocios")
      .select("id, nombre, slug, descripcion, plan, verificado, foto_portada, a_domicilio, zona_cobertura, creado_en, telefono, categorias:categoria_id(nombre, slug, emoji)")
      .eq("activo", true)
      .order("creado_en", { ascending: true })
      .range(offset, offset);
    if (delDiaData?.[0]) negocioDelDia = toNegocio(delDiaData[0]);
  }

  // ── Lo más visto de la semana (estadisticas_diarias es tabla cerrada:
  //    se consulta server-side con service role, solo lectura agregada) ──────
  // eslint-disable-next-line react-hooks/purity -- Server Component: se renderiza una vez por request, leer el reloj aca es correcto
  const hace7 = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
  const { data: statsSemana } = await supabaseAdmin
    .from("estadisticas_diarias")
    .select("negocio_id, vistas")
    .gte("fecha", hace7);
  const vistasPorNegocio = new Map<string, number>();
  for (const row of ((statsSemana ?? []) as { negocio_id: string; vistas: number }[])) {
    vistasPorNegocio.set(row.negocio_id, (vistasPorNegocio.get(row.negocio_id) ?? 0) + (row.vistas ?? 0));
  }
  // Lo más visto debe aportar una señal distinta a Destacados:
  // excluimos los negocios que ya ocupan ese bloque y mantenemos el ranking
  // real de vistas de los últimos 7 días entre los restantes.
  const destacadosIds = new Set(destacados.map(n => n.id));
  const topIds = [...vistasPorNegocio.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([id, v]) => v > 0 && !destacadosIds.has(id))
    .slice(0, 4)
    .map(([id]) => id);
  let masVistos: NegocioCard[] = [];
  if (topIds.length > 0) {
    const { data: masVistosData } = await supabase
      .from("negocios")
      .select("id, nombre, slug, descripcion, plan, verificado, foto_portada, a_domicilio, zona_cobertura, creado_en, telefono, categorias:categoria_id(nombre, slug, emoji)")
      .eq("activo", true)
      .in("id", topIds);
    masVistos = ((masVistosData ?? []) as unknown[])
      .map(toNegocio)
      .sort((a, b) => (vistasPorNegocio.get(b.id) ?? 0) - (vistasPorNegocio.get(a.id) ?? 0));
  }

  // ── Horarios: qué negocios están abiertos ahora ───────────────────────────
  // Se calcula sobre todos los negocios activos, no solo sobre carruseles
  // promocionales, para que esta sección cumpla realmente su promesa de utilidad.
  const openIdsArr = await getOpenIdsHoy();
  const openIds = new Set(openIdsArr);

  let negociosAbiertos: NegocioCard[] = [];
  if (openIdsArr.length > 0) {
    const { data: abiertosData } = await supabase
      .from("negocios")
      .select("id, nombre, slug, descripcion, plan, verificado, foto_portada, a_domicilio, zona_cobertura, creado_en, telefono, categorias:categoria_id(nombre, slug, emoji)")
      .eq("activo", true)
      .in("id", openIdsArr)
      .order("plan", { ascending: false })
      .order("verificado", { ascending: false })
      .order("creado_en", { ascending: false })
      .limit(8);
    negociosAbiertos = ((abiertosData ?? []) as unknown[]).map(toNegocio);
  }
  const abiertosCount = negociosAbiertos.length;

  return (
    <main className="ly-home flex-1 w-full bg-[#F9F8F6]">
      <JsonLd id="ld-organization" data={organizationJsonLd()} />
      <JsonLd id="ld-website"      data={websiteJsonLd()} />

      {/* Splash de bienvenida: el león, cada vez que se abre la portada */}
      <SplashHomeLeon />

      {/* Hero — full-bleed en desktop, contenido centrado adentro */}
      <Hero totalNegocios={totalNegocios} abiertosAhora={abiertosCount} verificados={verificadosCount ?? 0} />

      {/* UX-01: acciones principales antes del contenido editorial */}
      <div className="mx-auto w-full max-w-2xl lg:hidden">
        <HomeIntentNav />
      </div>

      {/* Contenido centrado */}
      <div className="mx-auto w-full max-w-2xl lg:max-w-full lg:px-4 xl:px-10">

      {/* Categorías principales: ya se muestran en la franja del hero */}

      {/* Abiertos ahora — glassmorphism */}
      {negociosAbiertos.length > 0 && (
        <section className="ly-open-now pt-5">
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
                <div key={n.id} className="group shrink-0 w-56 overflow-hidden rounded-2xl bg-white shadow-[0_2px_14px_rgba(0,0,0,0.08)] border border-[#F0EDE8] transition hover:shadow-[0_10px_26px_rgba(0,0,0,0.14)] hover:-translate-y-1">
                  {/* Banda de foto baja: impacto visual sin agrandar la card */}
                  <Link href={url} className="relative block h-32 w-full overflow-hidden bg-[#F0EDE8]">
                    {n.foto_portada ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        loading="lazy"
                        decoding="async"
                        src={n.foto_portada}
                        alt={n.nombre}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-3xl">
                        {n.categorias?.emoji ?? "🏪"}
                      </span>
                    )}
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-700">Abierto</span>
                    </span>
                  </Link>
                  <Link href={url} className="block p-3 pt-2 pb-2">
                    <p className="text-sm font-bold text-[#1A1410] truncate leading-tight group-hover:text-[#2B6E80] transition-colors">{n.nombre}</p>
                    <p className="text-[10px] text-[#8E8279] mt-0.5 truncate">
                      {n.categorias?.emoji} {n.categorias?.nombre}
                    </p>
                  </Link>
                  {n.telefono ? (
                    <a
                      href={telLink(n.telefono) ?? undefined}
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

      {/* Bloque editorial principal: destacados + ofertas + vitrinas laterales */}
      <div className="ly-showcase-grid">
      {/* Negocios destacados — carrusel visual de negocios reales */}
      {destacados.length > 0 && (
        <section className="ly-featured-section pt-9 pb-3" aria-labelledby="ly-featured-title">
          <div className="mb-5 flex items-end justify-between gap-3 px-4 sm:px-6">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2 text-[#2B6E80]">
                <Store size={21} strokeWidth={2.5} aria-hidden="true" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em]">Descubre lo local</span>
              </div>
              <h2 id="ly-featured-title" className="text-2xl font-black tracking-tight text-[#14283D] sm:text-3xl">Negocios destacados</h2>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">Conoce y apoya los negocios locales de Linares.</p>
            </div>
            <Link href="/buscar" className="mb-1 inline-flex shrink-0 items-center gap-1.5 text-sm font-extrabold text-[#16798A] transition hover:text-[#0B5361]">
              Ver todo <NudgeArrow />
            </Link>
          </div>
          <div className="ly-featured-track">
            <MarqueeRow speed={0.28}>
              {destacados.map((d, i) => {
                const url = d.categorias ? `/${d.categorias.slug}/${d.slug}` : "#";
                const rating = ratingsMap.get(d.id);
                return (
                  <Link
                    key={d.id}
                    href={url}
                    className="ly-featured-card group relative block w-[min(78vw,300px)] shrink-0 overflow-hidden rounded-[1.35rem] border border-slate-100 bg-white shadow-[0_8px_24px_rgba(20,40,61,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(20,40,61,0.17)] sm:w-[320px]"
                  >
                    <div className={`relative aspect-[4/3] w-full overflow-hidden ${catColor(i)}`}>
                      {d.foto_portada
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img loading="lazy" decoding="async" src={d.foto_portada} alt={d.nombre} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#DCEEF0] to-[#F4F7F8] text-6xl">{d.categorias?.emoji ?? "📍"}</div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/10" />
                      <span className="absolute left-3 top-3 max-w-[72%] truncate rounded-full bg-[#176E80]/95 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg backdrop-blur-sm">
                        {d.categorias?.nombre ?? "Negocio local"}
                      </span>
                      <div className="absolute right-3 top-3 rounded-full bg-white shadow-lg">
                        <FavoritoButton negocioId={d.id} variant="icon" />
                      </div>
                      {esPremium(d) && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-amber-300 px-2.5 py-1 text-[11px] font-extrabold text-slate-900 shadow">Premium</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="truncate text-lg font-black leading-tight tracking-tight text-[#14283D] group-hover:text-[#16798A]">{d.nombre}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                        {rating && rating.count > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[#14283D]">
                            <Star size={17} fill="#F5A900" stroke="#F5A900" aria-hidden="true" />
                            {(rating.sum / rating.count).toFixed(1)}
                            <span className="font-medium text-slate-500">({rating.count} reseñas)</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">Negocio local</span>
                        )}
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <MapPin size={16} strokeWidth={2.2} aria-hidden="true" /> Linares
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                        {d.verificado ? <span className="text-xs font-bold text-emerald-700">✓ Negocio verificado</span> : <span className="text-xs font-semibold text-slate-400">Conoce su ficha</span>}
                        <span className="text-sm font-extrabold text-[#16798A]">Ver negocio →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </MarqueeRow>
          </div>
        </section>
      )}

      {/* Ofertas activas */}
      {ofertas.length > 0 && (
        <section className="pt-7">
        <FadeInSection>
          <div className="flex items-center justify-between px-4 mb-3">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[#1A1410]">Ofertas imperdibles</h2>
              <p className="text-xs text-[#8E8279]">Aprovecha las promociones de los negocios locales.</p>
            </div>
            <Link href="/ofertas" className="text-xs font-bold text-[#2B6E80]">Ver todas <NudgeArrow /></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
            {ofertas.map(o => {
              const url  = o.negocio?.categoria_slug && o.negocio?.slug ? `/${o.negocio.categoria_slug}/${o.negocio.slug}` : "#";
              // eslint-disable-next-line react-hooks/purity -- Server Component: se renderiza una vez por request, leer el reloj aca es correcto
              const dias = Math.ceil((new Date(o.fecha_fin).getTime() - Date.now()) / 86_400_000);
              return (
                <Link key={o.id} href={url} className="relative w-[232px] shrink-0 overflow-hidden rounded-2xl border border-[#E8E4DE] bg-white shadow-linares-sm hover:shadow-linares transition">
                  <div className="relative flex h-24 items-center justify-center bg-gradient-to-br from-[#F9F8F6] to-[#E8E4DE]">
                    {o.imagen_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img loading="lazy" decoding="async" src={o.imagen_url} alt={o.titulo} className="h-full w-full object-cover" />
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

        <aside className="ly-home-side-promos" aria-label="Descubre Linares">
          <a href="/buscar?q=turismo" className="ly-side-promo ly-side-tourism">
            <span className="ly-side-copy">
              <strong>Turismo en Linares</strong>
              <span>Naturaleza, cultura y experiencias para disfrutar la ciudad y sus alrededores.</span>
              <b>Explorar atractivos <span aria-hidden="true">→</span></b>
            </span>
          </a>
          <a href="/agenda" className="ly-side-promo ly-side-events">
            <span className="ly-side-copy">
              <strong>Eventos en Linares</strong>
              <span>Descubre actividades, ferias y panoramas para compartir en la ciudad.</span>
              <b>Ver eventos <span aria-hidden="true">→</span></b>
            </span>
          </a>
        </aside>
      </div>

      {/* Servicios útiles de Linares */}
      <LinaresEsencial />

      {/* Descubre un negocio de Linares — rotación diaria automática */}
      {negocioDelDia && (
        <section className="px-4 pt-6">
          <FadeInSection>
            <Link
              href={negocioDelDia.categorias ? `/${negocioDelDia.categorias.slug}/${negocioDelDia.slug}` : "#"}
              className="relative block overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1410] to-[#3D3428] shadow-[0_6px_24px_rgba(0,0,0,0.18)] active:scale-[0.99] transition"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                  {negocioDelDia.foto_portada
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img loading="lazy" decoding="async" src={negocioDelDia.foto_portada} alt={negocioDelDia.nombre} className="h-full w-full object-cover" />
                    : <span>{negocioDelDia.categorias?.emoji ?? "🏪"}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F4B860] px-2 py-0.5 text-[9px] font-extrabold text-[#1A1410]">
                    ✨ Descubre un negocio
                  </span>
                  <p className="mt-1.5 truncate text-base font-black text-white leading-tight">{negocioDelDia.nombre}</p>
                  <p className="mt-0.5 truncate text-[10px] text-white/55">Una opción que quizás todavía no conocías.</p>
                  <p className="truncate text-[11px] text-white/60">
                    {negocioDelDia.categorias?.emoji} {negocioDelDia.categorias?.nombre}
                    {negocioDelDia.verificado ? " · ✓ Verificado" : ""}
                  </p>
                </div>
                <span className="shrink-0 text-white/50 text-lg">→</span>
              </div>
            </Link>
          </FadeInSection>
        </section>
      )}

      {/* Nuevos en LinaresYa — incorporaciones recientes */}
      {recientes.length > 0 && (
        <section className="pt-8">
          <div className="flex items-end justify-between px-4 mb-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#1A1410]">Nuevos en LinaresYa</h2>
              <p className="text-xs text-[#8E8279]">Negocios que se incorporaron recientemente</p>
            </div>
          </div>
          <MarqueeRow speed={0.35}>
            {recientes.map((d, i) => {
              const url = d.categorias ? `/${d.categorias.slug}/${d.slug}` : "#";
              return (
                <Link key={d.id} href={url} className="group block w-[218px] lg:w-[232px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_2px_14px_rgba(0,0,0,0.08)] border border-[#F0EDE8] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_14px_32px_rgba(0,0,0,0.16)]">
                  <div className={`relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center text-5xl ${catColor(i + 4)}`}>
                    {d.foto_portada
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img loading="lazy" decoding="async" src={d.foto_portada} alt={d.nombre} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      : <span className="transition-transform duration-500 group-hover:scale-110">{d.categorias?.emoji ?? "📍"}</span>}
                    <span className="absolute left-2 top-2 rounded-full bg-[#1A1410] px-2 py-0.5 text-[9px] font-bold text-white">Nuevo</span>
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
                    <p className="truncate text-sm font-black text-[#1A1410] group-hover:text-[#2B6E80] transition-colors">{d.nombre}</p>
                    <p className="mt-0.5 truncate text-[10px] text-[#8E8279]">{d.categorias?.emoji} {d.categorias?.nombre}</p>
                  </div>
                </Link>
              );
            })}
          </MarqueeRow>
        </section>
      )}

      {/* Banner publicitario / captación contextual */}
      <section className="px-4 pt-8">
        <AdvertisementBanner negocio={bannerNegocio} fallbackCta={!bannerNegocio} />
      </section>

      {/* Agenda de eventos — vida local */}
      {eventos_home.length > 0 && (
        <section className="pt-8">
          <div className="flex items-end justify-between px-4 mb-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#1A1410]">🗓️ Agenda de Linares</h2>
              <p className="text-xs text-[#8E8279]">Panoramas y eventos de la ciudad</p>
            </div>
            <Link href="/agenda" className="text-xs font-bold text-[#2B6E80]">Ver todos <NudgeArrow /></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
            {eventos_home.map(e => {
              const d = new Date(e.fecha_inicio);
              const dia = d.getDate();
              const mes = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][d.getMonth()];
              return (
                <Link
                  key={e.id}
                  href="/agenda"
                  className="flex w-56 shrink-0 items-center gap-3 rounded-2xl bg-white border border-[#F0EDE8] shadow-linares-sm p-3 hover:shadow-linares transition active:scale-[0.98]"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#2B6E80] text-white">
                    <span className="text-base font-black leading-none">{dia}</span>
                    <span className="text-[9px] font-bold uppercase">{mes}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#1A1410]">{e.emoji} {e.titulo}</p>
                    <p className="truncate text-[10px] text-[#8E8279]">📍 {e.lugar}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Historias premium — estilo Instagram */}
      <StoriesBar historias={historias} />

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

      {/* Lo más visto — ranking compacto de actividad real de la semana */}
      {masVistos.length > 0 && (
        <section className="mt-10 border-t border-[#E8E4DE] pt-8 px-4 sm:px-6 lg:px-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1410]">🔥 Lo más visto</h2>
              <p className="mt-1 text-base sm:text-lg font-medium text-[#59636B]">Los negocios que más miran los vecinos esta semana</p>
            </div>
            <Link href="/buscar" className="shrink-0 text-sm sm:text-base font-bold text-[#2B6E80] hover:text-[#C05A46] transition-colors">
              Explorar negocios <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {masVistos.map((n, i) => {
              const url = n.categorias ? `/${n.categorias.slug}/${n.slug}` : "#";
              const vistas = vistasPorNegocio.get(n.id) ?? 0;
              return (
                <AnimatedCard key={n.id} index={i}>
                  <Link
                    href={url}
                    className="group flex min-h-[88px] items-center gap-4 rounded-2xl border border-[#E9EDF0] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(20,40,50,0.045)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2B6E80]/35 hover:shadow-[0_8px_22px_rgba(20,40,50,0.10)]"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${i === 0 ? "bg-[#F4B860] text-[#1A1410]" : "bg-[#F0F2F4] text-[#7B8790]"}`}>
                      {i + 1}
                    </span>
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-[#F3F5F6] flex items-center justify-center text-2xl">
                      {n.foto_portada
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img loading="lazy" decoding="async" src={n.foto_portada} alt={n.nombre} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        : <span>{n.categorias?.emoji ?? "🏪"}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base sm:text-lg font-extrabold leading-snug text-[#17232B] group-hover:text-[#2B6E80] transition-colors">{n.nombre}</p>
                      <p className="mt-1 truncate text-sm font-medium text-[#66727B]">{n.categorias?.emoji} {n.categorias?.nombre}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#FFF5F1] px-3 py-2 text-xs sm:text-sm font-bold text-[#A94432]">
                      <span aria-hidden="true">↗</span> {vistas} {vistas === 1 ? "vista" : "vistas"}
                    </span>
                  </Link>
                </AnimatedCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Reseñas recientes — prueba social */}
      {resenasRecientes.length > 0 && (
        <section className="mt-12 border-t border-[#E8E4DE] pt-8 px-4 sm:px-6 lg:px-10">
          <div className="mb-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#6B625C]">Confianza local</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1410]">Lo que dicen los vecinos</h2>
            <p className="mt-1 text-base sm:text-lg text-[#59636B]">Reseñas reales de clientes de Linares</p>
          </div>
          <div className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-3 lg:space-y-0">
            {resenasRecientes.map((r, i) => {
              const fichaUrl = r.categoriaSlug && r.negocioSlug ? `/${r.categoriaSlug}/${r.negocioSlug}` : null;
              return (
                <AnimatedCard key={r.id} index={i}>
                <div className="rounded-2xl bg-white shadow-linares-sm p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg font-extrabold text-[#1A1410] truncate">{r.autor_nombre}</p>
                      {fichaUrl ? (
                        <Link href={fichaUrl} className="text-sm text-[#2B6E80] font-semibold hover:underline truncate block">
                          {r.categoriaEmoji} {r.negocioNombre}
                        </Link>
                      ) : (
                        <p className="text-sm text-[#59636B] truncate">{r.categoriaEmoji} {r.negocioNombre}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-amber-500 font-extrabold text-lg tracking-tight">
                      {"★".repeat(Math.min(5, r.estrellas))}<span className="text-[#E8E4DE]">{"★".repeat(5 - Math.min(5, r.estrellas))}</span>
                    </span>
                  </div>
                  <p className="mt-2 text-base text-[#334155] leading-relaxed line-clamp-3 italic">
                    &ldquo;{r.comentario}&rdquo;
                  </p>
                </div>
                </AnimatedCard>
              );
            })}
          </div>
          <Link href="/buscar" className="mt-4 block text-center text-base font-bold text-[#2B6E80]">
            Ver todos los negocios <NudgeArrow />
          </Link>
        </section>
      )}

      {/* Newsletter — franja panorámica según diseño aprobado */}
      <section className="relative left-1/2 mt-14 w-screen -translate-x-1/2 overflow-hidden px-3 py-6 sm:px-5 lg:px-8 lg:py-10">
        <FadeInSection className="relative isolate mx-auto min-h-[560px] w-full max-w-[1920px] overflow-hidden rounded-[2rem] border border-white/70 bg-[#063b43] shadow-[0_22px_60px_rgba(4,35,42,0.22)] sm:min-h-[590px] lg:min-h-[620px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-cover bg-[center_48%]"
            style={{ backgroundImage: "url('/hero-plaza-kiosco.jpg')", backgroundPosition: "center 52%", backgroundSize: "cover" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,42,49,0.97)_0%,rgba(3,55,64,0.91)_34%,rgba(3,64,72,0.52)_53%,rgba(3,55,64,0.12)_70%,rgba(3,55,64,0.02)_100%)]"
          />
          <div className="grid min-h-[560px] grid-cols-1 items-center gap-8 px-6 py-10 sm:px-10 lg:min-h-[620px] lg:grid-cols-12 lg:gap-6 lg:px-12 xl:px-16">
            <div className="max-w-3xl lg:col-span-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-base font-bold text-white shadow-sm backdrop-blur-md sm:text-lg">
                <span aria-hidden="true" className="text-2xl">✉</span>
                Novedades de Linares
              </div>
              <div aria-hidden="true" className="mb-2 mt-5 h-1.5 w-16 rounded-full bg-[#ff5b5f]" />
              <h2 className="!text-white max-w-3xl text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl xl:text-6xl" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
                Entérate primero de ofertas y negocios nuevos en <span className="text-[#ff6268]">Linares</span>
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed !text-white sm:text-xl" style={{ color: "rgba(255,255,255,0.96)", WebkitTextFillColor: "rgba(255,255,255,0.96)" }}>
                Un resumen semanal con lo mejor de Linares, directo a tu email.
              </p>
              <div className="mt-8 max-w-3xl">
                <NewsletterForm />
              </div>
              <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-white/80 sm:text-base">
                <span aria-hidden="true" className="text-xl text-[#ffb36b]">♙</span>
                Sin spam. Puedes darte de baja cuando quieras.
                <span className="hidden text-white/50 sm:inline">|</span>
                <Link href="/privacidad" className="underline decoration-white/60 underline-offset-4 hover:text-white">Política de Privacidad</Link>
              </p>
            </div>

            <div className="grid gap-4 lg:col-span-3 lg:col-start-7">
              <div className="flex min-h-24 items-center gap-5 rounded-3xl border border-white/25 bg-white/10 px-5 py-5 text-white shadow-lg backdrop-blur-md sm:px-6">
                <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/30 bg-white/10 text-3xl">♧</span>
                <span className="text-lg font-bold leading-snug sm:text-xl">Ofertas y promociones locales</span>
              </div>
              <div className="flex min-h-24 items-center gap-5 rounded-3xl border border-white/25 bg-white/10 px-5 py-5 text-white shadow-lg backdrop-blur-md sm:px-6">
                <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/30 bg-white/10 text-3xl">⌂</span>
                <span className="text-lg font-bold leading-snug sm:text-xl">Nuevos negocios en Linares</span>
              </div>
              <div className="flex min-h-24 items-center gap-5 rounded-3xl border border-white/25 bg-white/10 px-5 py-5 text-white shadow-lg backdrop-blur-md sm:px-6">
                <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/30 bg-white/10 text-3xl">▦</span>
                <span className="text-lg font-bold leading-snug sm:text-xl">Eventos y novedades de la ciudad</span>
              </div>
            </div>
            <div className="hidden lg:col-span-3 lg:col-start-10 lg:block" aria-hidden="true" />
          </div>
          <div className="absolute bottom-6 right-6 rounded-2xl bg-white px-5 py-3 text-2xl font-extrabold tracking-tight text-[#073c45] shadow-xl sm:bottom-8 sm:right-8 sm:px-7 sm:py-4 sm:text-3xl">
            <span className="text-[#f45159]">●</span> Linares<span className="text-[#f45159]">Ya</span>
          </div>
        </FadeInSection>
      </section>


      </div>{/* /contenido centrado */}

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
