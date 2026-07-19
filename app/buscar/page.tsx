import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { diaHoySantiago, horaAhoraSantiago, badgeAbierto, dentroDeRango } from "@/lib/horarios";
import AnimatedCard from "@/components/AnimatedCard";

const WA_SUGERIR = "56984272557";
function waLinkSugerir(termino: string) {
  const msg = termino
    ? `Hola! Busqué "${termino}" en LinaresYa y no encontré lo que necesitaba. ¿Pueden agregar ese negocio al directorio de Linares?`
    : `Hola! Quiero sugerir un negocio para el directorio de LinaresYa.`;
  return `https://wa.me/${WA_SUGERIR}?text=${encodeURIComponent(msg)}`;
}

export const metadata = {
  title: "Buscar - LinaresYa",
  description: "Busca negocios, oficios y servicios en Linares.",
};

type NegocioRow = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  tipo: "negocio" | "independiente";
  plan: "basico" | "premium";
  verificado: boolean;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  a_domicilio: boolean;
  foto_portada: string | null;
  categorias: { id: number; nombre: string; slug: string; emoji: string } | null;
};

type Categoria = { id: number; nombre: string; slug: string; emoji: string };


export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const categoriaSlug = typeof sp.categoria === "string" ? sp.categoria : "";
  const tipo = sp.tipo === "independiente" || sp.tipo === "negocio" ? sp.tipo : "";
  const premium = sp.premium === "1";
  const verificado = sp.verificado === "1";
  const abierto = sp.abierto === "1";
  const domicilio = sp.domicilio === "1";
  const orden = sp.orden === "rating" ? "rating" : "relevancia";

  const { data: catsData } = await supabase
    .from("categorias")
    .select("id, nombre, slug, emoji")
    .eq("activa", true)
    .order("orden");
  const categorias = (catsData ?? []) as Categoria[];
  const categoriaActiva = categoriaSlug
    ? categorias.find((c) => c.slug === categoriaSlug)
    : undefined;

  let openIds: string[] | null = null;
  if (abierto) {
    const dia = diaHoySantiago();
    const ahora = horaAhoraSantiago();
    const { data: horarios } = await supabase
      .from("horarios")
      .select("negocio_id, abre, cierra")
      .eq("dia", dia)
      .eq("cerrado", false);
    openIds = ((horarios ?? []) as { negocio_id: string; abre: string | null; cierra: string | null }[])
      .filter((h) => h.abre && h.cierra && dentroDeRango(ahora, h.abre, h.cierra))
      .map((h) => h.negocio_id);
  }

  let query = supabase
    .from("negocios")
    .select(
      "id, nombre, slug, descripcion, tipo, plan, verificado, telefono, whatsapp, direccion, a_domicilio, foto_portada, categorias:categoria_id(id, nombre, slug, emoji)",
    )
    .eq("activo", true);

  if (q) {
    // Full-text search con la config spanish_unaccent (ver supabase/busqueda.sql).
    // websearch_to_tsquery acepta sintaxis amigable:
    //   "pizza don vittorio"  -> AND implicito
    //   '"pizza napolitana"'  -> frase exacta
    //   'comida OR almacen'   -> OR explicito
    //   'pizza -pollo'        -> excluir "pollo"
    // Cortamos a 80 chars por las dudas (evitar abuso).
    const term = q.slice(0, 80);
    query = query.textSearch("busqueda", term, {
      type: "websearch",
      config: "spanish_unaccent",
    });
  }
  if (categoriaActiva) query = query.eq("categoria_id", categoriaActiva.id);
  if (tipo) query = query.eq("tipo", tipo);
  if (premium) query = query.eq("plan", "premium");
  if (verificado) query = query.eq("verificado", true);
  if (domicilio) query = query.eq("a_domicilio", true);
  if (openIds !== null) {
    if (openIds.length === 0) {
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.in("id", openIds);
    }
  }

  const { data: rows } = await query
    .order("plan", { ascending: false })
    .order("verificado", { ascending: false })
    .order("nombre", { ascending: true })
    .limit(100);

  const items = (rows ?? []) as unknown as NegocioRow[];

  // Ratings: traemos estrellas aprobadas para los resultados y agregamos en JS.
  type ResenaRating = { negocio_id: string; estrellas: number };
  const ratingsMap = new Map<string, { sum: number; count: number }>();
  if (items.length > 0) {
    const ids = items.map((n) => n.id);
    const { data: resenasData } = await supabase
      .from("resenas")
      .select("negocio_id, estrellas")
      .in("negocio_id", ids)
      .eq("aprobada", true);
    for (const r of ((resenasData ?? []) as ResenaRating[])) {
      const prev = ratingsMap.get(r.negocio_id) ?? { sum: 0, count: 0 };
      ratingsMap.set(r.negocio_id, { sum: prev.sum + r.estrellas, count: prev.count + 1 });
    }
  }

  // Ordenar por rating si se pidió (sort JS sobre los hasta 100 resultados)
  let itemsOrdenados = [...items];
  if (orden === "rating") {
    itemsOrdenados.sort((a, b) => {
      const ra = ratingsMap.get(a.id);
      const rb = ratingsMap.get(b.id);
      const avgA = ra && ra.count > 0 ? ra.sum / ra.count : 0;
      const avgB = rb && rb.count > 0 ? rb.sum / rb.count : 0;
      if (avgB !== avgA) return avgB - avgA;
      // desempate: plan premium > verificado > nombre
      if ((b.plan === "premium" ? 1 : 0) !== (a.plan === "premium" ? 1 : 0))
        return (b.plan === "premium" ? 1 : 0) - (a.plan === "premium" ? 1 : 0);
      return a.nombre.localeCompare(b.nombre, "es");
    });
  }

  // Calcular cuáles están abiertos ahora (cuando no se filtró por abierto,
  // igual mostramos el badge para que el usuario sepa el estado de cada uno)
  const allIds = items.map((n) => n.id);
  let resultOpenIds: string[] = openIds ?? [];
  if (!abierto && allIds.length > 0) {
    const dia = diaHoySantiago();
    const ahora = horaAhoraSantiago();
    const { data: h } = await supabase
      .from("horarios")
      .select("negocio_id, abre, cierra")
      .in("negocio_id", allIds)
      .eq("dia", dia)
      .eq("cerrado", false);
    resultOpenIds = ((h ?? []) as { negocio_id: string; abre: string | null; cierra: string | null }[])
      .filter((x) => x.abre && x.cierra && dentroDeRango(ahora, x.abre, x.cierra))
      .map((x) => x.negocio_id);
  }

  function urlWith(changes: Record<string, string | null>): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoriaSlug) params.set("categoria", categoriaSlug);
    if (tipo) params.set("tipo", tipo);
    if (premium) params.set("premium", "1");
    if (verificado) params.set("verificado", "1");
    if (abierto) params.set("abierto", "1");
    if (domicilio) params.set("domicilio", "1");
    if (orden !== "relevancia") params.set("orden", orden);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/buscar?${qs}` : "/buscar";
  }

  const hayFiltros =
    Boolean(q) || Boolean(categoriaSlug) || Boolean(tipo) || premium || verificado || abierto || domicilio;

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl lg:max-w-6xl">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-base font-bold tracking-tight flex-1">Buscar</h1>
        </div>

        <div className="px-4 pb-3">
          <form action="/buscar" method="get" className="flex items-center gap-2 bg-secondary rounded-full px-4 py-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted-foreground">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder="Buscar negocios, oficios, servicios"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              autoFocus={!q && !hayFiltros}
            />
            {categoriaSlug && <input type="hidden" name="categoria" value={categoriaSlug} />}
            {tipo && <input type="hidden" name="tipo" value={tipo} />}
            {premium && <input type="hidden" name="premium" value="1" />}
            {verificado && <input type="hidden" name="verificado" value="1" />}
            {abierto && <input type="hidden" name="abierto" value="1" />}
            {domicilio && <input type="hidden" name="domicilio" value="1" />}
          </form>
        </div>

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          <FilterPill href={urlWith({ abierto: abierto ? null : "1" })} active={abierto}>
            Abierto ahora
          </FilterPill>
          <FilterPill href={urlWith({ premium: premium ? null : "1" })} active={premium}>
            Premium
          </FilterPill>
          <FilterPill href={urlWith({ verificado: verificado ? null : "1" })} active={verificado}>
            Verificados
          </FilterPill>
          <FilterPill href={urlWith({ domicilio: domicilio ? null : "1" })} active={domicilio}>
            A domicilio
          </FilterPill>
          <FilterPill href={urlWith({ tipo: tipo === "independiente" ? null : "independiente" })} active={tipo === "independiente"}>
            Independientes
          </FilterPill>
        </div>

        {hayFiltros && (
          <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
            {q && <ChipQuitar label={`"${q}"`} href={urlWith({ q: null })} />}
            {categoriaActiva && (
              <ChipQuitar label={`${categoriaActiva.emoji} ${categoriaActiva.nombre}`} href={urlWith({ categoria: null })} />
            )}
            <Link
              href="/buscar"
              className="text-[11px] font-semibold text-muted-foreground underline underline-offset-2 ml-auto"
            >
              Limpiar todo
            </Link>
          </div>
        )}
      </header>

      {!categoriaActiva && (
        <section className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={urlWith({ categoria: c.slug })}
              className="shrink-0 rounded-full bg-white border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
            >
              {c.emoji} {c.nombre}
            </Link>
          ))}
        </section>
      )}

      <section className="pt-4 pb-10">
        <div className="px-4 mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-muted-foreground">
            {itemsOrdenados.length} resultado{itemsOrdenados.length === 1 ? "" : "s"}
          </p>
          <div className="flex gap-1.5 shrink-0">
            <Link
              href={urlWith({ orden: null })}
              className={`rounded-full text-[11px] font-semibold px-3 py-1 transition ${orden === "relevancia" ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-muted"}`}
            >
              Relevancia
            </Link>
            <Link
              href={urlWith({ orden: "rating" })}
              className={`rounded-full text-[11px] font-semibold px-3 py-1 transition ${orden === "rating" ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-muted"}`}
            >
              ★ Mejor valorados
            </Link>
          </div>
        </div>

        {itemsOrdenados.length === 0 ? (
          <div className="mx-4 rounded-3xl border border-dashed border-border p-8 sm:p-10 text-center">
            <div className="text-5xl mb-3">{"\u{1F50D}"}</div>
            <h2 className="text-lg font-bold">
              {q ? `No encontramos "${q}"` : "No encontramos nada"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
              {hayFiltros
                ? "Probá quitar algunos filtros o cambiar los términos."
                : "Escribe algo arriba o filtrá por categoría."}
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
              {hayFiltros && (
                <Link
                  href="/buscar"
                  className="inline-flex items-center rounded-full bg-foreground text-background text-sm font-semibold px-5 py-2.5"
                >
                  Limpiar filtros
                </Link>
              )}
              <Link
                href="/publicar"
                className="inline-flex items-center rounded-full bg-secondary text-foreground text-sm font-semibold px-5 py-2.5 hover:bg-secondary/80 transition"
              >
                {q ? `Publicar "${q}"` : "Publicar tu negocio"}
              </Link>
            </div>

            {/* Sugerir negocio */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                ¿Conocés un negocio que debería estar acá?
              </p>
              <a
                href={waLinkSugerir(q)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white text-sm font-bold px-5 py-2.5 hover:bg-[#1ebe5d] transition"
              >
                <WhatsAppIcon /> Sugerir un negocio
              </a>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Lo contactamos y lo invitamos a publicarse.
              </p>
            </div>

            {categorias.length > 0 && (
              <div className="mt-7">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Explorá categorías
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {categorias.slice(0, 6).map((c) => (
                    <Link
                      key={c.id}
                      href={`/${c.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 hover:bg-secondary text-sm font-medium px-3 py-1.5 transition"
                    >
                      <span>{c.emoji}</span>
                      {c.nombre}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {itemsOrdenados.map((n, i) => {
              const rData = ratingsMap.get(n.id);
              const rating = rData && rData.count > 0
                ? { avg: rData.sum / rData.count, count: rData.count }
                : null;
              return (
                <AnimatedCard key={n.id} index={i}>
                  <NegocioCard n={n} isOpen={resultOpenIds.includes(n.id)} rating={rating} />
                </AnimatedCard>
              );
            })}
          </div>
        )}

        {/* Pie "¿No está lo que buscas?" — se muestra cuando hay resultados pero con búsqueda activa */}
        {itemsOrdenados.length > 0 && hayFiltros && (
          <div className="mx-4 mt-4 mb-2 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-secondary/50 px-5 py-4">
            <p className="text-sm text-muted-foreground">
              ¿No está el negocio que buscabas?
            </p>
            <a
              href={waLinkSugerir(q)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white text-xs font-bold px-4 py-2 hover:bg-[#1ebe5d] transition"
            >
              <WhatsAppIcon /> Sugerilo
            </a>
          </div>
        )}
      </section>
    </main>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 3 17l-1 5 5.2-1.4A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 20.5Z" />
    </svg>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full text-sm font-semibold px-4 py-2 whitespace-nowrap transition ${
        active ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}

function ChipQuitar({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full bg-foreground text-background text-[11px] font-semibold px-3 py-1"
    >
      {label}
      <span className="text-background/70">{"\u00D7"}</span>
    </Link>
  );
}

function NegocioCard({ n, isOpen, rating }: { n: NegocioRow; isOpen?: boolean; rating?: { avg: number; count: number } | null }) {
  const esPremium = n.plan === "premium";
  const waNumber = n.whatsapp?.replace(/\D/g, "");
  const categoriaSlug = n.categorias?.slug ?? "sin-categoria";
  const href = `/${categoriaSlug}/${n.slug}`;

  return (
    <div className="relative rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all group">
      <Link href={href} aria-label={n.nombre} className="absolute inset-0 z-10" />

      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EDE8]">
        {n.foto_portada ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={n.foto_portada} alt={n.nombre} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-4xl opacity-30">🏪</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border ${
            isOpen ? "bg-emerald-500/80 text-white border-emerald-400/40" : "bg-black/50 text-white/80 border-white/10"
          }`}>
            {isOpen ? "● Abierto" : "● Cerrado"}
          </span>
        </div>
        {esPremium && (
          <div className="absolute top-2 right-2">
            <span className="text-[9px] font-bold bg-[#F4B860] text-[#1A1410] px-1.5 py-0.5 rounded-full">⭐ Premium</span>
          </div>
        )}
        {n.verificado && (
          <div className="absolute top-2 left-2">
            <span className="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center shadow">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 relative z-10">
        {n.categorias && (
          <span className="text-[10px] font-semibold text-muted-foreground">{n.categorias.emoji} {n.categorias.nombre}</span>
        )}
        <p className="font-bold text-[13px] text-[#1A1410] leading-tight line-clamp-1 mt-0.5">{n.nombre}</p>
        {n.descripcion && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">{n.descripcion}</p>
        )}
        <div className="mt-2 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            {rating && <span className="text-[11px] font-bold text-amber-600">★ {rating.avg.toFixed(1)}</span>}
            {n.a_domicilio && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">🛵</span>}
          </div>
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
