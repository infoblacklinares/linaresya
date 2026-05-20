import Link from "next/link";
import { supabase } from "@/lib/supabase";
import JsonLd from "@/components/JsonLd";
import FavoritoButton from "@/components/FavoritoButton";
import Hero from "@/components/Hero";
import AdvertisementBanner from "@/components/AdvertisementBanner";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";

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
  categorias: { nombre: string; slug: string; emoji: string } | null;
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
    { data: countData },
  ] = await Promise.all([
    supabase.from("categorias").select("*").order("orden"),

    supabase
      .from("negocios")
      .select("id, nombre, slug, descripcion, plan, verificado, foto_portada, a_domicilio, zona_cobertura, creado_en, categorias:categoria_id(nombre, slug, emoji)")
      .eq("activo", true)
      .order("plan",      { ascending: false })
      .order("verificado",{ ascending: false })
      .order("creado_en", { ascending: false })
      .limit(6),

    supabase
      .from("negocios")
      .select("id, nombre, slug, descripcion, plan, verificado, foto_portada, a_domicilio, zona_cobertura, creado_en, categorias:categoria_id(nombre, slug, emoji)")
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

  const cats       = (categorias ?? []) as Categoria[];
  const destacados = ((destacadosData ?? []) as unknown[]).map(toNegocio);
  const recientes  = ((recientesData  ?? []) as unknown[])
    .map(toNegocio)
    .filter(r => !destacados.some(d => d.id === r.id))
    .slice(0, 4);

  const ofertas: OfertaHome[] = ((ofertasData ?? []) as unknown[]).map(r => {
    const x   = r as Record<string, unknown>;
    const neg = Array.isArray(x.negocios) ? x.negocios[0] : x.negocios;
    const cat = neg && typeof neg === "object"
      ? (Array.isArray((neg as Record<string, unknown>).categorias)
          ? (neg as Record<string, unknown>).categorias[0]
          : (neg as Record<string, unknown>).categorias)
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

  const primerPremium = destacados.find(d => d.plan === "premium");
  const bannerNegocio = primerPremium ? {
    nombre:        primerPremium.nombre,
    slug:          primerPremium.slug,
    categoria_slug: primerPremium.categorias?.slug ?? "",
    descripcion:   primerPremium.descripcion,
    emoji:         primerPremium.categorias?.emoji ?? "🏪",
  } : undefined;

  const totalNegocios = (countData as unknown as { count?: number } | null)?.count ?? destacados.length;

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl bg-[#F9F8F6]">
      <JsonLd id="ld-organization" data={organizationJsonLd()} />
      <JsonLd id="ld-website"      data={websiteJsonLd()} />

      {/* Hero */}
      <Hero totalNegocios={totalNegocios} />

      {/* Filtros rápidos */}
      <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-1 no-scrollbar">
        {[
          { label: "Todos",        href: "/buscar" },
          { label: "Abierto ahora",href: "/buscar?abierto=1" },
          { label: "Premium",      href: "/buscar?premium=1" },
          { label: "Verificados",  href: "/buscar?verificado=1" },
          { label: "A domicilio",  href: "/buscar?domicilio=1" },
        ].map((f, i) => (
          <Link
            key={f.href}
            href={f.href}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              i === 0
                ? "bg-[#2B6E80] text-white shadow-sm"
                : "border border-[#E8E4DE] bg-white text-[#1A1410] shadow-sm hover:bg-[#2B6E80]/5"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Categorías */}
      <section className="pt-6">
        <div className="flex items-end justify-between px-4 mb-3">
          <h2 className="text-base font-extrabold tracking-tight text-[#1A1410]">Categorías</h2>
          <Link href="/buscar" className="text-xs font-semibold text-[#2B6E80]">Ver todas →</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
          {cats.map((cat, i) => (
            <Link key={cat.id} href={`/${cat.slug}`} className="flex shrink-0 flex-col items-center gap-1.5 group">
              <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl text-2xl shadow-linares-sm transition group-hover:-translate-y-0.5 ${catColor(i)}`}>
                {cat.emoji}
                {i === cats.length - 1 && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-[#C05A46] px-1.5 py-0.5 text-[8px] font-bold text-white">New</span>
                )}
              </div>
              <span className="w-16 text-center text-[10px] font-medium leading-tight text-[#8E8279]">{cat.nombre}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Banner publicitario */}
      <AdvertisementBanner negocio={bannerNegocio} fallbackCta={!bannerNegocio} />

      {/* Ofertas activas */}
      {ofertas.length > 0 && (
        <section className="pt-7">
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
        </section>
      )}

      {/* Destacados */}
      {destacados.length > 0 && (
        <section className="pt-8">
          <div className="flex items-end justify-between px-4 mb-1">
            <h2 className="text-xl font-extrabold tracking-tight text-[#1A1410]">Destacados</h2>
            <Link href="/buscar" className="text-xs font-semibold text-[#2B6E80]">Ver todo →</Link>
          </div>
          <p className="px-4 mb-4 text-xs text-[#8E8279]">Negocios verificados y premium de la comunidad.</p>
          <ul className="space-y-2 px-4">
            {destacados.map(d => {
              const url = d.categorias ? `/${d.categorias.slug}/${d.slug}` : "#";
              return (
                <li key={d.id}>
                  <Link href={url} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-linares-sm transition hover:shadow-linares">
                    <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E8E4DE] bg-[#F9F8F6] text-3xl">
                      {d.foto_portada
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={d.foto_portada} alt={d.nombre} className="h-full w-full object-cover" />
                        : <span>{d.categorias?.emoji ?? "📍"}</span>}
                      <div className="absolute left-1.5 top-1.5">
                        <FavoritoButton negocioId={d.id} variant="icon" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-bold text-[#1A1410]">{d.nombre}</p>
                        {d.verificado && <span className="shrink-0 rounded-full bg-[#2B6E80]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#2B6E80]">✓ Verificado</span>}
                        {d.plan === "premium" && <span className="shrink-0 rounded-full bg-[#F4B860]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#8B5E0A]">⭐ Premium</span>}
                        {esNuevo(d.creado_en) && <span className="shrink-0 rounded-full bg-[#3D5A45]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#3D5A45]">Nuevo</span>}
                      </div>
                      {d.descripcion && <p className="mt-0.5 truncate text-xs text-[#8E8279]">{d.descripcion}</p>}
                      <p className="mt-0.5 truncate text-[11px] text-[#8E8279]">
                        {d.categorias?.emoji} {d.categorias?.nombre}{d.a_domicilio && " · A domicilio"}
                      </p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8279" strokeWidth="2" className="shrink-0"><path d="m9 18 6-6-6-6" /></svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Recién sumados */}
      {recientes.length > 0 && (
        <section className="pt-8">
          <div className="px-4 mb-3">
            <h2 className="text-xl font-extrabold tracking-tight text-[#1A1410]">Recién sumados</h2>
            <p className="text-xs text-[#8E8279]">Los últimos en publicarse en LinaresYa.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4">
            {recientes.map((d, i) => {
              const url = d.categorias ? `/${d.categorias.slug}/${d.slug}` : "#";
              return (
                <Link key={d.id} href={url} className="overflow-hidden rounded-2xl bg-white shadow-linares-sm hover:shadow-linares transition">
                  <div className={`relative flex h-28 w-full items-center justify-center text-4xl ${catColor(i + 4)}`}>
                    {d.foto_portada
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={d.foto_portada} alt={d.nombre} className="h-full w-full object-cover" />
                      : <span>{d.categorias?.emoji ?? "📍"}</span>}
                    {esNuevo(d.creado_en) && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#3D5A45] px-2 py-0.5 text-[9px] font-bold text-white">Nuevo</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-bold text-[#1A1410]">{d.nombre}</p>
                    <p className="mt-0.5 truncate text-[10px] text-[#8E8279]">{d.categorias?.emoji} {d.categorias?.nombre}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Grid completo de categorías */}
      <section className="pb-24 pt-10">
        <div className="px-4 mb-3">
          <h2 className="text-xl font-extrabold tracking-tight text-[#1A1410]">Todas las categorías</h2>
          <p className="text-xs text-[#8E8279]">12 categorías cubriendo todo Linares.</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 px-4">
          {cats.map((cat, i) => (
            <li key={cat.id}>
              <Link href={`/${cat.slug}`} className={`flex items-center gap-3 rounded-2xl p-4 shadow-linares-sm transition hover:shadow-linares ${catColor(i)}`}>
                <span className="text-2xl">{cat.emoji}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{cat.nombre}</p>
                  <p className="text-[10px] opacity-60">/{cat.slug}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

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
