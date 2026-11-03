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
      <section className="relative isolate overflow-hidden text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero-plaza-kiosco.jpg')" }} />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#062b32]/95 via-[#073b43]/75 to-[#073b43]/10" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#062b32]/45 via-transparent to-black/10" />

        <div className="relative mx-auto grid min-h-[440px] w-full max-w-[1600px] items-center gap-8 px-5 py-12 sm:px-8 lg:min-h-[500px] lg:grid-cols-[minmax(0,1fr)_300px] lg:px-14 xl:px-20">
          <div className="max-w-[760px]">
            <span className="mb-5 inline-flex items-center rounded-full border border-white/25 bg-[#f5b7a7]/95 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[.08em] text-[#102b35] shadow-sm">
              Directorio local de Linares
            </span>
            <h1 className="max-w-[780px] text-4xl font-extrabold leading-[1.02] tracking-[-.045em] text-white sm:text-5xl lg:text-[3.8rem] xl:text-[4.35rem]">
              Descubre, conecta y apoya los negocios de <span className="text-[#ff5964]">Linares</span>
            </h1>
            <p className="mt-5 max-w-[620px] text-base font-medium leading-relaxed text-white/95 sm:text-xl">
              Servicios, comercios, ofertas y novedades de tu ciudad, en un solo lugar.
            </p>

            <div className="relative z-20 mt-7 w-full max-w-[760px] rounded-2xl bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.32)] sm:p-2">
              <SearchAutocomplete variant="hero" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {CATEGORIAS.map((cat) => (
                <a key={cat.label} href={cat.href} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-bold text-white shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/25">
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

      <section className="relative z-10 mx-auto -mt-1 w-full max-w-[1600px] px-4 py-5 sm:px-8 lg:px-14 xl:px-20">
        <div className="rounded-3xl border border-slate-100 bg-white/95 px-3 py-3 shadow-[0_12px_32px_rgba(15,23,42,.10)] backdrop-blur sm:px-5">
          <div className="ly-category-marquee overflow-hidden">
            <div className="ly-category-track flex w-max gap-2 pb-1 sm:gap-3">
              {[...CATEGORIAS, ...CATEGORIAS].map((cat, index) => (
                <a key={`${cat.label}-${index}`} href={cat.href} className="group flex w-[112px] shrink-0 flex-col items-center rounded-2xl border border-slate-100 bg-white px-3 py-3 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:w-[132px]">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition group-hover:scale-105 ${cat.tone}`} aria-hidden="true">{cat.icon}</span>
                  <span className="mt-2.5 text-sm font-extrabold leading-tight text-slate-800">{cat.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
