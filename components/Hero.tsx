"use client";

import SearchAutocomplete from "@/components/SearchAutocomplete";
import { CheckCircle2, Clock3, House, CarFront, HeartPulse, MoreHorizontal, Store, Utensils } from "lucide-react";

interface HeroProps {
  totalNegocios?: number;
  abiertosAhora?: number;
  verificados?: number;
}

const CATEGORIAS = [
  { label: "Restaurantes", Icon: Utensils, href: "/buscar?q=restaurantes" },
  { label: "Salud", Icon: HeartPulse, href: "/buscar?q=salud" },
  { label: "Hogar", Icon: House, href: "/buscar?q=hogar" },
  { label: "Automotriz", Icon: CarFront, href: "/buscar?q=automotriz" },
  { label: "Más categorías", Icon: MoreHorizontal, href: "/categorias" },
];

export default function Hero({ totalNegocios = 0, abiertosAhora = 0, verificados = 0 }: HeroProps) {
  return (
    <section className="ly-mobile-hero relative isolate overflow-hidden text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-[center_58%] lg:bg-center" style={{ backgroundImage: "url('/hero-plaza-kiosco.jpg')" }} />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#062b32]/95 via-[#073b43]/78 to-[#073b43]/20" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#062b32]/80 via-[#062b32]/25 to-[#062b32]/30" />

      <div className="relative mx-auto grid min-h-[300px] w-full max-w-[1600px] items-center gap-8 px-4 py-7 sm:min-h-[340px] sm:px-8 lg:min-h-[500px] lg:grid-cols-[minmax(0,1fr)_300px] lg:px-14 lg:py-14 xl:px-20">
        <div className="w-full max-w-[780px]">
          <span className="mb-4 hidden items-center rounded-full border border-white/30 bg-[#f5b7a7]/95 px-4 py-2 text-xs font-extrabold uppercase tracking-[.08em] text-[#102b35] shadow-sm lg:inline-flex">
            Directorio local de Linares
          </span>
          <h1 className="mb-0 hidden max-w-[780px] !text-white text-5xl font-extrabold leading-[1.04] tracking-[-.045em] lg:mb-0 lg:block lg:text-[3.8rem] xl:text-[4.35rem]">
            Descubre, conecta y apoya los negocios de <span className="text-[#ff5964]">Linares</span>
          </h1>
          <p className="mt-5 hidden max-w-[620px] text-xl font-semibold leading-relaxed text-white lg:block">
            Servicios, comercios, ofertas y novedades de tu ciudad, en un solo lugar.
          </p>

          <div className="relative z-20 w-full max-w-[760px] rounded-2xl bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.32)] lg:mt-7 lg:p-2">
            <SearchAutocomplete variant="hero" />
          </div>

          <nav aria-label="Categorías principales" className="ly-mobile-hero-pills mt-3 flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden pb-1 sm:mt-4 sm:flex-wrap sm:overflow-visible">
            {CATEGORIAS.map(({ label, Icon, href }) => (
              <a key={label} href={href} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-white/30 bg-[#073b43]/75 px-3.5 py-2 text-sm font-bold text-white shadow-sm backdrop-blur-md transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <Icon aria-hidden="true" size={17} strokeWidth={2.3} />
                {label}
              </a>
            ))}
          </nav>
        </div>

        <aside className="hidden rounded-[1.75rem] border border-white/35 bg-[#073b43]/75 p-5 text-white shadow-[0_20px_55px_rgba(0,0,0,.25)] backdrop-blur-xl lg:block" aria-label="LinaresYa en cifras">
          <div className="flex items-center gap-4 border-b border-white/15 py-4 first:pt-1">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><Store size={25} /></span>
            <div><p className="text-2xl font-extrabold tracking-tight">{totalNegocios.toLocaleString("es-CL")}+</p><p className="text-sm font-semibold text-white/80">Negocios locales</p></div>
          </div>
          <div className="flex items-center gap-4 border-b border-white/15 py-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><Clock3 size={25} /></span>
            <div><p className="text-2xl font-extrabold tracking-tight">{abiertosAhora.toLocaleString("es-CL")}</p><p className="text-sm font-semibold text-white/80">Abiertos ahora</p></div>
          </div>
          <div className="flex items-center gap-4 py-4 pb-1">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><CheckCircle2 size={25} /></span>
            <div><p className="text-2xl font-extrabold tracking-tight">{verificados.toLocaleString("es-CL")}</p><p className="text-sm font-semibold text-white/80">Negocios verificados</p></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
