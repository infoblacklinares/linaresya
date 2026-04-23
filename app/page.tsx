import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  emoji: string;
  descripcion: string | null;
  activa: boolean;
  orden: number;
};

const destacados = [
  {
    nombre: "Pizzeria Don Vittorio",
    categoria: "Gastronomia",
    rating: 4.8,
    tiempo: "20-30 min",
    extra: "Envio gratis",
    emoji: "\u{1F355}",
    bg: "bg-orange-100",
  },
  {
    nombre: "Peluqueria Camila",
    categoria: "Belleza",
    rating: 4.9,
    tiempo: "Cita hoy",
    extra: "Promo -20%",
    emoji: "\u{1F487}",
    bg: "bg-pink-100",
  },
  {
    nombre: "Don Pedro - Soldador",
    categoria: "Oficios",
    rating: 4.7,
    tiempo: "Disponible",
    extra: "WhatsApp directo",
    emoji: "\u{1F527}",
    bg: "bg-blue-100",
  },
  {
    nombre: "Veterinaria Patitas",
    categoria: "Mascotas",
    rating: 4.9,
    tiempo: "Abre 9:00",
    extra: "Urgencias 24h",
    emoji: "\u{1F43E}",
    bg: "bg-emerald-100",
  },
];

export default async function Home() {
  const { data: categorias, error } = await supabase
    .from("categorias")
    .select("*")
    .order("orden");

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

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
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
      <section className="pt-8">
        <div className="px-4 flex items-end justify-between mb-1">
          <h3 className="text-xl font-extrabold tracking-tight">Joyitas escondidas</h3>
          <a href="#todas" className="text-xs font-semibold text-muted-foreground">
            Ver todo
          </a>
        </div>
        <p className="px-4 text-sm text-muted-foreground mb-4">
          Lugares y oficios que recomiendan los vecinos.
        </p>

        <ul className="px-4 space-y-3">
          {destacados.map((d, i) => (
            <li key={i}>
              <a href="#" className="flex items-center gap-3 p-2 rounded-2xl hover:bg-secondary/60 transition">
                <div className={`relative h-20 w-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 ${d.bg}`}>
                  {d.emoji}
                  <button
                    aria-label="Favorito"
                    className="absolute top-1.5 left-1.5 h-7 w-7 rounded-full bg-white/95 flex items-center justify-center text-foreground"
                  >
                    <HeartIcon />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px] truncate">{d.nombre}</p>
                  <p className="text-[13px] text-muted-foreground truncate">
                    {d.extra} - {d.tiempo}
                  </p>
                  <p className="text-[12px] text-muted-foreground/80">{d.categoria}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-secondary text-xs font-bold flex items-center justify-center">
                  {d.rating}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>

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
