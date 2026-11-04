"use client";

import SearchAutocomplete from "@/components/SearchAutocomplete";

interface HeroProps {
  totalNegocios?: number;
  abiertosAhora?: number;
  verificados?: number;
}

const CATEGORIAS = [
  { label: "Restaurantes", icon: "🍽️", href: "/buscar?q=restaurantes", tone: "bg-orange-100 text-orange-700" },
  { label: "Salud", icon: "💗", href: "/buscar?q=salud", tone: "bg-rose-100 text-rose-700" },
  { label: "Hogar", icon: "🏠", href: "/buscar?q=hogar", tone: "bg-emerald-100 text-emerald-700" },
  { label: "Automotriz", icon: "🚘", href: "/buscar?q=automotriz", tone: "bg-blue-100 text-blue-700" },
  { label: "Más categorías", icon: "•••", href: "/categorias", tone: "bg-slate-100 text-slate-700" },
];

export default function Hero({ totalNegocios = 0, abiertosAhora = 0, verificados = 0 }: HeroProps) {
  return (
    <>
      <section className="ly-mobile-hero relative isolate overflow-hidden text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-cover bg-[center_58%] lg:bg-center" style={{ backgroundImage: "url('/hero-plaza-kiosco.jpg')" }} />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#062b32]/95 via-[#073b43]/78 to-[#073b43]/20" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#062b32]/70 via-transparent to-[#062b32]/20" />

        <div className="relative mx-auto grid min-h-[500px] w-full max-w-[1600px] items-center gap-8 px-5 py-9 sm:min-h-[520px] sm:px-8 sm:py-12 lg:min-h-[500px] lg:grid-cols-[minmax(0,1fr)_300px] lg:px-14 lg:py-14 xl:px-20">
          <div className="w-full max-w-[780px]">
            <span className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-[#f5b7a7]/95 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[.08em] text-[#102b35] shadow-sm sm:mb-5 sm:text-xs">
              Directorio local de Linares
            </span>
            <h1 className="max-w-[780px] !text-white text-[2.15rem] font-extrabold leading-[1.04] tracking-[-.045em] sm:text-5xl lg:text-[3.8rem] xl:text-[4.35rem]">
              Descubre, conecta y apoya los negocios de <span className="text-[#ff5964]">Linares</span>
            </h1>
            <p className="mt-4 max-w-[620px] text-base font-semibold leading-relaxed text-white sm:mt-5 sm:text-xl">
              Servicios, comercios, ofertas y novedades de tu ciudad, en un solo lugar.
            </p>

            <div className="relative z-20 mt-6 w-full max-w-[760px] rounded-2xl bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.32)] sm:mt-7 sm:p-2">
              <SearchAutocomplete variant="hero" />
            </div>

            <div className="ly-mobile-hero-pills mt-4 flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden pb-1 sm:flex-wrap sm:overflow-visible">
              {CATEGORIAS.map((cat) => (
                <a key={cat.label} href={cat.href} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-white/30 bg-[#073b43]/65 px-3 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-md transition hover:bg-white/25 sm:min-h-0 sm:px-4 sm:text-sm">
                  <span aria-hidden="true">{cat.icon}</span>{cat.label}
                </a>
              ))}
            </div>
          </div>

          <aside className="hidden rounded-[1.75rem] border border-white/35 bg-[#073b43]/75 p-5 text-white shadow-[0_20px_55px_rgba(0,0,0,.25)] backdrop-blur-xl lg:block" aria-label="LinaresYa en cifras">
            <div className="flex items-center gap-4 border-b border-white/15 py-4 first:pt-1">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">🏪</span>
              <div><p className="text-2xl font-extrabold tracking-tight">{totalNegocios.toLocaleString("es-CL")}+</p><p className="text-sm font-semibold text-white/80">Negocios locales</p></div>
            </div>
            <div className="flex items-center gap-4 border-b border-white/15 py-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">🟢</span>
              <div><p className="text-2xl font-extrabold tracking-tight">{abiertosAhora.toLocaleString("es-CL")}</p><p className="text-sm font-semibold text-white/80">Abiertos ahora</p></div>
            </div>
            <div className="flex items-center gap-4 py-4 pb-1">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">✓</span>
              <div><p className="text-2xl font-extrabold tracking-tight">{verificados.toLocaleString("es-CL")}</p><p className="text-sm font-semibold text-white/80">Negocios verificados</p></div>
            </div>
          </aside>
        </div>
      </section>

    </>
  );
}
