import Link from "next/link";

interface HeroProps {
  totalNegocios?: number;
  abiertosAhora?: number;
}

const QUICK = [
  { label: "🔧 Gasfíter",    href: "/buscar?q=gasfiter" },
  { label: "🦷 Dentista",    href: "/buscar?q=dentista" },
  { label: "🍽️ Restaurante", href: "/buscar?q=restaurante" },
  { label: "🚗 Taller",      href: "/buscar?q=taller" },
  { label: "🐾 Veterinaria", href: "/buscar?q=veterinaria" },
];

export default function Hero({ totalNegocios, abiertosAhora }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2B6E80] via-[#205f72] to-[#163d4e]">
      {/* Orbes decorativos glassmorphism */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-[#F4B860]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-8 h-32 w-32 rounded-full bg-[#C05A46]/10 blur-2xl" />

      <div className="relative px-4 pt-6 pb-7">
        {/* Chip de ubicación */}
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
          <PinIcon />
          Linares, Región del Maule
        </div>

        {/* Titular estilo Uber Eats */}
        <h1 className="mb-1 text-[1.9rem] font-black leading-[1.1] tracking-tight text-white">
          Hola, Linares 👋
        </h1>
        <p className="mb-5 text-sm text-white/60 leading-snug">
          Negocios locales, horarios reales y ofertas de hoy.
        </p>

        {/* Stats — tarjetas glass */}
        {(totalNegocios || abiertosAhora) ? (
          <div className="mb-5 flex gap-2">
            {totalNegocios ? (
              <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <span className="text-lg leading-none">🏪</span>
                <div>
                  <p className="text-xs font-black leading-none text-white">{totalNegocios}+</p>
                  <p className="mt-0.5 text-[10px] leading-none text-white/55">negocios</p>
                </div>
              </div>
            ) : null}
            {abiertosAhora ? (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/15 px-3 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <div>
                  <p className="text-xs font-black leading-none text-emerald-300">{abiertosAhora}</p>
                  <p className="mt-0.5 text-[10px] leading-none text-emerald-400/70">abiertos ahora</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : <div className="mb-5" />}

        {/* Buscador glass */}
        <form action="/buscar" method="get">
          <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-1.5 pl-4 backdrop-blur-md">
            <SearchIcon className="shrink-0 text-white/50" />
            <input
              name="q"
              type="search"
              placeholder="gasfíter, dentista, restaurante…"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#2B6E80] transition hover:bg-white/90 active:scale-95"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Búsquedas rápidas */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {QUICK.map(q => (
            <Link
              key={q.href}
              href={q.href}
              className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
            >
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
