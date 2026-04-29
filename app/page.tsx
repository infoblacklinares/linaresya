import Link from "next/link";
import { supabase } from "@/lib/supabase";
import JsonLd from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";

type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  emoji: string;
  descripcion: string | null;
  activa: boolean;
  orden: number;
};

type NegocioDestacado = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  plan: "basico" | "premium";
  verificado: boolean;
  foto_portada: string | null;
  a_domicilio: boolean;
  zona_cobertura: string | null;
  categorias: { nombre: string; slug: string; emoji: string } | null;
};

function normalizeCategoria(raw: unknown): NegocioDestacado["categorias"] {
  const x = Array.isArray(raw) ? raw[0] : raw;
  if (!x || typeof x !== "object") return null;
  return {
    nombre: String((x as { nombre?: unknown }).nombre ?? ""),
    slug: String((x as { slug?: unknown }).slug ?? ""),
    emoji: String((x as { emoji?: unknown }).emoji ?? ""),
  };
}

export default async function Home() {
  const [{ data: categorias, error }, { data: destacadosData }] = await Promise.all([
    supabase.from("categorias").select("*").order("orden"),
    supabase
      .from("negocios")
      .select(
        "id, nombre, slug, descripcion, plan, verificado, foto_portada, a_domicilio, zona_cobertura, categorias:categoria_id(nombre, slug, emoji)",
      )
      .eq("activo", true)
      .order("plan", { ascending: false })
      .order("verificado", { ascending: false })
      .order("creado_en", { ascending: false })
      .limit(6),
  ]);

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="ue-shadow rounded-3xl p-8 max-w-md text-center bg-white">
          <p className="text-lg font-semibold">Error conectando con Supabase</p>
          <p className="text-sm text-muted-foreground mt-2">
            Revisa tus variables de entorno.
          </p>
        </div>
      </main>
    );
  }

  const cats = (categorias ?? []) as Categoria[];
  const destacados: NegocioDestacado[] = ((destacadosData ?? []) as unknown[]).map((r) => {
    const x = r as Record<string, unknown>;
    return {
      id: String(x.id ?? ""),
      nombre: String(x.nombre ?? ""),
      slug: String(x.slug ?? ""),
      descripcion: (x.descripcion as string | null) ?? null,
      plan: (x.plan as "basico" | "premium") ?? "basico",
      verificado: Boolean(x.verificado),
      foto_portada: (x.foto_portada as string | null) ?? null,
      a_domicilio: Boolean(x.a_domicilio),
      zona_cobertura: (x.zona_cobertura as string | null) ?? null,
      categorias: normalizeCategoria(x.categorias),
    };
  });

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      <JsonLd id="ld-organization" data={organizationJsonLd()} />
      <JsonLd id="ld-website" data={websiteJsonLd()} />
      {/* Header sticky */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-border">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <button className="flex items-center gap-1.5 font-semibold text-sm">
            <PinIcon /> Linares, Chile
            <ChevronIcon />
          </button>
          <div className="flex items-center gap-2">
            <Link
              href="/publicar"
              className="rounded-full bg-foreground text-background text-xs font-semibold px-3 py-1.5"
            >
              Publicar
            </Link>
            <button className="ue-pill !py-1.5 flex items-center gap-1.5">
              <ClockIcon /> Ahora
            </button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <form
            action="/buscar"
            method="get"
            className="flex items-center gap-2 bg-secondary rounded-full px-4 py-3"
          >
            <SearchIcon />
            <input
              name="q"
              type="text"
              placeholder="Buscar negocios, oficios, servicios"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </form>
        </div>

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          <Link
            href="/buscar"
            className="rounded-full bg-foreground text-background text-sm font-semibold px-4 py-2 whitespace-nowrap"
          >
            Todos
          </Link>
          <Link href="/buscar?abierto=1" className="ue-pill whitespace-nowrap">Abierto ahora</Link>
          <Link href="/buscar?premium=1" className="ue-pill whitespace-nowrap">Premium</Link>
          <Link href="/buscar?verificado=1" className="ue-pill whitespace-nowrap">Verificados</Link>
          <Link href="/buscar?domicilio=1" className="ue-pill whitespace-nowrap">A domicilio</Link>
        </div>
      </header>

      {/* Hero promo */}
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-[oklch(0.94_0.04_80)] p-6 sm:p-8">
          <div className="max-w-[60%]">
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-foreground">
              Sumate gratis a LinaresYa
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Apareces frente a miles de vecinos buscando lo que ofreces.
            </p>
            <Link
              href="/publicar"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground text-background text-sm font-semibold px-4 py-2"
            >
              Publicar negocio
            </Link>
          </div>
          <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-7xl sm:text-8xl opacity-90 select-none">
            {"\u{1F6CD}"}
          </div>
        </div>
      </section>

      {/* Categorias scroll horizontal */}
      <section className="pt-6">
        <div className="px-4 flex items-end justify-between mb-3">
          <h3 className="text-base font-bold tracking-tight">Categorias</h3>
          <a href="#todas" className="text-xs font-semibold text-muted-foreground">
            Ver todas
          </a>
        </div>
        <div className="px-4 flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {cats.map((cat, i) => (
            <a
              key={cat.id}
              href={`/${cat.slug}`}
              className="flex flex-col items-center gap-2 min-w-[72px] group"
            >
              <div
                className={`relative h-16 w-16 rounded-2xl flex items-center justify-center text-3xl ue-shadow-sm group-hover:-translate-y-0.5 transition ${pastel(i)}`}
              >
                {cat.emoji}
                {i === 11 && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                    Nuevo
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-foreground/80 text-center leading-tight">
                {cat.nombre}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Destacados */}
      {destacados.length > 0 && (
        <section className="pt-8">
          <div className="px-4 flex items-end justify-between mb-1">
            <h3 className="text-xl font-extrabold tracking-tight">Destacados</h3>
            <Link href="/buscar" className="text-xs font-semibold text-muted-foreground">
              Ver todo
            </Link>
          </div>
          <p className="px-4 text-sm text-muted-foreground mb-4">
            Negocios verificados y premium de la comunidad.
          </p>

          <ul className="px-4 space-y-3">
            {destacados.map((d, i) => {
              const url = d.categorias
                ? `/${d.categorias.slug}/${d.slug}`
                : "#";
              return (
                <li key={d.id}>
                  <Link
                    href={url}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-secondary/60 transition"
                  >
                    <div
                      className={`relative h-20 w-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 overflow-hidden ${pastel(i)}`}
                    >
                      {d.foto_portada ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.foto_portada}
                          alt={d.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{d.categorias?.emoji ?? "📍"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-[15px] truncate">{d.nombre}</p>
                        {d.verificado && (
                          <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full shrink-0">
                            ✓
                          </span>
                        )}
                        {d.plan === "premium" && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full shrink-0">
                            Premium
                          </span>
                        )}
                      </div>
                      {d.descripcion && (
                        <p className="text-[13px] text-muted-foreground truncate">
                          {d.descripcion}
                        </p>
                      )}
                      <p className="text-[12px] text-muted-foreground/80 truncate">
                        {d.categorias?.emoji} {d.categorias?.nombre}
                        {d.a_domicilio && " • A domicilio"}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Grid completo de categorias */}
      <section id="todas" className="pt-10 pb-6">
        <div className="px-4 mb-3">
          <h3 className="text-xl font-extrabold tracking-tight">Todas las categorias</h3>
          <p className="text-sm text-muted-foreground">12 categorias cubriendo todo Linares.</p>
        </div>
        <ul className="px-4 grid grid-cols-2 gap-3">
          {cats.map((cat, i) => (
            <li key={cat.id}>
              <a
                href={`/${cat.slug}`}
                className={`flex items-center gap-3 p-4 rounded-2xl ue-shadow-sm hover:ue-shadow transition ${pastel(i)}`}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{cat.nombre}</p>
                  <p className="text-[11px] text-foreground/60">/{cat.slug}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Bottom tab nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-border">
        <div className="mx-auto max-w-2xl grid grid-cols-4 px-2 py-2">
          <TabItem icon={<HomeIcon />} label="Inicio" href="/" active />
          <TabItem icon={<SearchIcon />} label="Buscar" href="/buscar" />
          <TabItem icon={<HeartIcon />} label="Favoritos" />
          <TabItem icon={<UserIcon />} label="Cuenta" />
        </div>
      </nav>
    </main>
  );
}

function pastel(i: number) {
  const palette = [
    "bg-orange-50",
    "bg-emerald-50",
    "bg-rose-50",
    "bg-sky-50",
    "bg-amber-50",
    "bg-violet-50",
    "bg-teal-50",
    "bg-pink-50",
    "bg-lime-50",
    "bg-indigo-50",
    "bg-yellow-50",
    "bg-fuchsia-50",
  ];
  return palette[i % palette.length];
}

function TabItem({
  icon,
  label,
  href,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
}) {
  const cls = `flex flex-col items-center gap-0.5 py-1.5 ${active ? "text-foreground" : "text-muted-foreground"}`;
  const content = (
    <>
      <span className={active ? "scale-110" : ""}>{icon}</span>
      <span className="text-[11px] font-semibold">{label}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return <button className={cls}>{content}</button>;
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}
