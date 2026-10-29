"use client";

import SearchAutocomplete from "@/components/SearchAutocomplete";

interface HeroProps {
  totalNegocios?: number;
  abiertosAhora?: number;
  verificados?: number;
}

const CATEGORIAS = [
  { label: "Comida", sub: "y Gastronomía", icon: "🍴", href: "/buscar?q=comida", tone: "bg-orange-100 text-orange-600" },
  { label: "Cafeterías", sub: "y Panaderías", icon: "☕", href: "/buscar?q=cafeteria", tone: "bg-amber-100 text-amber-800" },
  { label: "Supermercados", sub: "y Minimarkets", icon: "🛒", href: "/buscar?q=supermercado", tone: "bg-rose-100 text-rose-600" },
  { label: "Salud", sub: "y Bienestar", icon: "💗", href: "/buscar?q=salud", tone: "bg-pink-100 text-pink-600" },
  { label: "Hogar", sub: "y Construcción", icon: "🏠", href: "/buscar?q=hogar", tone: "bg-blue-100 text-blue-600" },
  { label: "Automotriz", sub: "", icon: "🚘", href: "/buscar?q=automotriz", tone: "bg-violet-100 text-violet-600" },
  { label: "Servicios", sub: "Profesionales", icon: "👥", href: "/buscar?q=servicios", tone: "bg-emerald-100 text-emerald-600" },
  { label: "Turismo", sub: "y Recreación", icon: "🌲", href: "/buscar?q=turismo", tone: "bg-cyan-100 text-cyan-600" },
  { label: "Belleza", sub: "y Estética", icon: "🌸", href: "/buscar?q=belleza", tone: "bg-fuchsia-100 text-fuchsia-600" },
];

export default function Hero({ totalNegocios, abiertosAhora, verificados }: HeroProps) {
  return (
    <>
      <section className="relative isolate overflow-visible text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/esencial/Plaza_de_Armas.jpg')" }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/10" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/10" />
        <div className="relative mx-auto flex min-h-[370px] max-w-[1440px] flex-col justify-center px-5 pb-12 pt-12 sm:px-8 lg:min-h-[390px] lg:px-12 lg:pb-14">
          <div className="max-w-[570px]">
            <p className="mb-3 flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[.18em] text-[#ff4268]">
              Apoya lo local <span className="h-px w-8 bg-[#ff4268]" />
            </p>
            <h1 className="max-w-[520px] text-[2.8rem] font-black leading-[.94] tracking-[-.055em] text-white sm:text-6xl lg:text-[3.5rem]">
              Descubre Linares de <span className="text-[#f51e4e]">verdad</span>
            </h1>
            <p className="mt-4 max-w-[430px] text-sm font-medium leading-relaxed text-white/95 sm:text-base">
              Negocios locales, ofertas, eventos y todo lo que necesitas en un solo lugar.
            </p>
          </div>
          <div className="relative z-20 mt-6 w-full max-w-[790px] rounded-xl bg-white p-1.5 shadow-[0_14px_42px_rgba(0,0,0,.3)] sm:p-2">
            <SearchAutocomplete variant="hero" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-white/90">
            {totalNegocios ? <span className="rounded-full bg-black/35 px-3 py-1.5 backdrop-blur">{totalNegocios.toLocaleString("es-CL")} negocios locales</span> : null}
            {abiertosAhora ? <span className="rounded-full bg-black/35 px-3 py-1.5 backdrop-blur">{abiertosAhora.toLocaleString("es-CL")} abiertos ahora</span> : null}
            {verificados ? <span className="rounded-full bg-black/35 px-3 py-1.5 backdrop-blur">{verificados.toLocaleString("es-CL")} verificados</span> : null}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-5 max-w-[1320px] rounded-2xl border border-slate-100 bg-white/95 px-3 py-3 shadow-[0_8px_28px_rgba(15,23,42,.12)] backdrop-blur sm:px-5">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:justify-between sm:gap-3">
          {CATEGORIAS.map((cat) => (
            <a key={cat.label} href={cat.href} className="group flex min-w-[82px] shrink-0 flex-col items-center rounded-xl px-2 py-2 text-center transition hover:bg-slate-50 sm:min-w-0 sm:flex-1">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition group-hover:scale-105 ${cat.tone}`} aria-hidden="true">{cat.icon}</span>
              <span className="mt-2 text-[11px] font-extrabold leading-tight text-slate-800">{cat.label}</span>
              {cat.sub ? <span className="mt-0.5 text-[9px] leading-tight text-slate-500">{cat.sub}</span> : null}
            </a>
          ))}
          <a href="/categorias" className="group flex min-w-[76px] shrink-0 flex-col items-center rounded-xl px-2 py-2 text-center transition hover:bg-slate-50 sm:min-w-0 sm:flex-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600" aria-hidden="true">•••</span>
            <span className="mt-2 text-[11px] font-extrabold leading-tight text-slate-800">Ver más</span>
          </a>
        </div>
      </section>
    </>
  );
}
