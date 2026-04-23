import { supabase } from "@/lib/supabase";
import Link from "next/link";

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

function diaHoySantiago(): "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo" {
  const fmt = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    weekday: "long",
  });
  const raw = fmt.format(new Date()).toLowerCase();
  const norm = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dias: Array<"lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo"> = [
    "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo",
  ];
  return (dias.find((d) => d === norm) ?? "lunes");
}

function horaAhoraSantiago(): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return fmt.format(new Date());
}

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
      .select("negocio_id")
      .eq("dia", dia)
      .eq("cerrado", false)
      .lte("abre", ahora)
      .gt("cierra", ahora);
    openIds = ((horarios ?? []) as { negocio_id: string }[]).map((h) => h.negocio_id);
  }

  let query = supabase
    .from("negocios")
    .select(
      "id, nombre, slug, descripcion, tipo, plan, verificado, telefono, whatsapp, direccion, a_domicilio, foto_portada, categorias:categoria_id(id, nombre, slug, emoji)",
    )
    .eq("activo", true);

  if (q) {
    const term = q.replace(/[%_,()]/g, "").slice(0, 60);
    query = query.or(`nombre.ilike.%${term}%,descripcion.ilike.%${term}%`);
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

  function urlWith(changes: Record<string, string | null>): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoriaSlug) params.set("categoria", categoriaSlug);
    if (tipo) params.set("tipo", tipo);
    if (premium) params.set("premium", "1");
    if (verificado) params.set("verificado", "1");
    if (abierto) params.set("abierto", "1");
    if (domicilio) params.set("domicilio", "1");
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
    <main className="flex-1 mx-auto w-full max-w-2xl">
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
        <div className="px-4 mb-3 flex items-end justify-between">
          <p className="text-xs font-semibold text-muted-foreground">
            {items.length} resultado{items.length === 1 ? "" : "s"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mx-4 rounded-3xl border border-dashed border-border p-10 text-center">
            <div className="text-5xl mb-3">{"\u{1F50D}"}</div>
            <h2 className="text-lg font-bold">No encontramos nada</h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
              {hayFiltros
                ? "Prueba quitar algunos filtros o cambiar los terminos."
                : "Escribe algo arriba o filtra por categoria."}
            </p>
            {hayFiltros && (
              <Link
                href="/buscar"
                className="mt-5 inline-flex items-center rounded-full bg-foreground text-background text-sm font-semibold px-4 py-2"
              >
                Limpiar filtros
              </Link>
            )}
          </div>
        ) : (
          <ul className="px-4 space-y-3">
            {items.map((n) => (
              <li key={n.id}>
                <NegocioCard n={n} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
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

function NegocioCard({ n }: { n: NegocioRow }) {
  const esPremium = n.plan === "premium";
  const waNumber = n.whatsapp?.replace(/\D/g, "");
  const categoriaSlug = n.categorias?.slug ?? "sin-categoria";
  const href = `/${categoriaSlug}/${n.slug}`;

  return (
    <div className="relative flex items-stretch gap-3 p-2 rounded-2xl hover:bg-secondary/60 transition group">
      <Link href={href} aria-label={n.nombre} className="absolute inset-0 rounded-2xl z-0" />

      <div className="relative z-10 h-24 w-24 rounded-2xl overflow-hidden shrink-0 bg-secondary flex items-center justify-center pointer-events-none">
        {n.foto_portada ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={n.foto_portada} alt={n.nombre} className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl opacity-60">{"\u{1F3EA}"}</span>
        )}
        {esPremium && (
          <span className="absolute top-1 left-1 text-[9px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded-full">
            Premium
          </span>
        )}
      </div>

      <div className="relative z-10 flex-1 min-w-0 py-1 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-[15px] truncate">{n.nombre}</p>
          {n.verificado && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-sky-500 shrink-0">
              <path d="M12 2 9.5 4.5 6 4l-.5 3.5L2 9l2 3-2 3 3.5 1.5L6 20l3.5-.5L12 22l2.5-2.5L18 20l.5-3.5L22 15l-2-3 2-3-3.5-1.5L18 4l-3.5.5L12 2Zm-1.2 13.6-3.2-3.2 1.4-1.4 1.8 1.8 4.4-4.4 1.4 1.4-5.8 5.8Z" />
            </svg>
          )}
        </div>
        <p className="text-[13px] text-muted-foreground line-clamp-2 mt-0.5">
          {n.descripcion ?? "Sin descripcion"}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
          {n.categorias && (
            <span className="bg-white border border-border px-2 py-0.5 rounded-full font-medium">
              {n.categorias.emoji} {n.categorias.nombre}
            </span>
          )}
          {n.tipo === "independiente" && (
            <span className="bg-secondary px-2 py-0.5 rounded-full font-medium">Independiente</span>
          )}
          {n.a_domicilio && (
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              A domicilio
            </span>
          )}
        </div>
      </div>

      <div className="relative z-20 flex flex-col items-end justify-between py-1 shrink-0">
        {waNumber && esPremium ? (
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 rounded-full bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 hover:bg-emerald-600 transition"
          >
            WhatsApp
          </a>
        ) : (
          <span className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition text-sm">
            {"\u2192"}
          </span>
        )}
      </div>
    </div>
  );
}
