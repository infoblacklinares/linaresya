"use client";

import SearchAutocomplete from "@/components/SearchAutocomplete";
import { CarFront, HeartPulse, House, MoreHorizontal, Store, Utensils } from "lucide-react";

interface HeroProps {
  totalNegocios?: number;
  abiertosAhora?: number;
  verificados?: number;
}

const CATEGORIAS = [
  { label: "Restaurantes", Icon: Utensils, href: "/buscar?q=restaurantes" },
  { label: "Salud", Icon: HeartPulse, href: "/buscar?q=salud" },
  { label: "Hogar", Icon: House, href: "/buscar?q=hogar" },
  { label: "Automóviles", Icon: CarFront, href: "/buscar?q=automotriz" },
  { label: "Ver categorías", Icon: MoreHorizontal, href: "/categorias" },
];

export default function Hero({ totalNegocios = 0 }: HeroProps) {
  return (
    <section className="ly-mobile-hero relative isolate overflow-hidden text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-[center_58%] lg:bg-center" style={{ backgroundImage: "url('/hero-plaza-kiosco.jpg')" }} />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#062b32]/95 via-[#073b43]/78 to-[#073b43]/25" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#062b32]/75 via-transparent to-[#062b32]/25" />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 pb-4 pt-5 sm:px-8 sm:pb-6 sm:pt-8 lg:px-14 lg:pb-10 lg:pt-12 xl:px-20">
        <div className="max-w-[760px]">
          <div className="mb-2 flex items-center gap-2 text-white/85">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15"><Store size={15} /></span>
            <span className="text-[10px] font-extrabold uppercase tracking-[.18em] sm:text-xs">Directorio local de Linares</span>
          </div>
          <h1 className="max-w-[620px] text-[1.65rem] font-extrabold leading-[1.06] tracking-[-.04em] text-white sm:text-4xl lg:text-5xl">
            Descubre negocios y servicios <span className="text-[#ff6472]">de Linares</span>
          </h1>
          <p className="mt-2 hidden max-w-xl text-sm leading-relaxed text-white/85 sm:block sm:text-base">
            Comercios, profesionales y servicios locales, en un solo lugar.
          </p>

          <div className="relative z-20 mt-4 w-full max-w-[680px] rounded-2xl bg-white p-1 shadow-[0_12px_34px_rgba(0,0,0,.25)] sm:mt-5 sm:p-1.5">
            <SearchAutocomplete variant="hero" />
          </div>

          <nav aria-label="Categorías principales" className="ly-mobile-hero-pills mt-3 flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden pb-1">
            {CATEGORIAS.map(({ label, Icon, href }) => (
              <a key={label} href={href} className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-[#073b43]/65 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-md transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:min-h-9 sm:px-3.5 sm:text-xs">
                <Icon aria-hidden="true" size={14} strokeWidth={2.2} />
                {label}
              </a>
            ))}
          </nav>
          {totalNegocios > 0 && <p className="mt-2 text-[10px] font-medium text-white/65 sm:text-xs">{totalNegocios.toLocaleString("es-CL")} negocios para descubrir</p>}
        </div>
      </div>
    </section>
  );
}
