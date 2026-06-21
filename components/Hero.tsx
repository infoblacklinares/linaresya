/**
 * Hero.tsx — Sección principal de LinaresYa
 * Server Component: no usa hooks, el buscador es un form nativo.
 */
import Link from "next/link";

interface HeroProps {
  totalNegocios?: number;
  abiertosAhora?: number;
}

export default function Hero({ totalNegocios, abiertosAhora }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2B6E80] via-[#1f5268] to-[#163d4e]">
      {/* Patrón decorativo de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-2xl px-4 py-8 pb-10">
        {/* Chip de localización */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
          <PinIcon />
          Linares, Región del Maule
        </div>

        {/* Titular */}
        <h1 className="mb-2 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
          Todo Linares<br />
          <span className="text-[#F4B860]">en un solo lugar</span>
        </h1>
        <p className="mb-3 text-sm text-white/70 leading-relaxed">
          Negocios locales, horarios reales y ofertas de hoy.
        </p>

        {/* Stats en vivo */}
        {(totalNegocios || abiertosAhora) ? (
          <div className="flex flex-wrap gap-2 mb-5">
            {totalNegocios ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                🏪 {totalNegocios}+ negocios
              </span>
            ) : null}
            {abiertosAhora ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/25 px-3 py-1 text-xs font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {abiertosAhora} abiertos ahora
              </span>
            ) : null}
          </div>
        ) : <div className="mb-5" />}

        {/* Buscador */}
        <form action="/buscar" method="get" className="flex gap-2">
          <div className="relative flex-1">
            <input
              name="q"
              type="search"
              placeholder="¿Qué buscas? gasfíter, dentista, restaurante…"
              autoComplete="off"
              className="w-full rounded-xl border-0 bg-white py-3.5 pl-4 pr-10 text-sm text-[#1A1410] placeholder-[#8E8279] shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C05A46]/50"
            />
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8279]" />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#C05A46] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#a84d3a] active:scale-95"
          >
            Buscar
          </button>
        </form>

        {/* Búsquedas frecuentes por necesidad */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "🔧 Gasfíter",     href: "/buscar?q=gasfiter" },
            { label: "🦷 Dentista",     href: "/buscar?q=dentista" },
            { label: "🍽️ Restaurante",  href: "/buscar?q=restaurante" },
            { label: "🚗 Taller",       href: "/buscar?q=taller" },
            { label: "🐾 Veterinaria",  href: "/buscar?q=veterinaria" },
          ].map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/20 active:scale-95"
            >
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Íconos inline (sin dependencia externa) ───────────────────────────────────
function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
