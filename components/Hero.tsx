"use client";

import SearchAutocomplete from "@/components/SearchAutocomplete";
import { CarFront, HeartPulse, House, MoreHorizontal, Store, Utensils } from "lucide-react";

const CATEGORIAS = [
  { label: "Restaurantes", Icon: Utensils, href: "/buscar?q=restaurantes" },
  { label: "Salud", Icon: HeartPulse, href: "/buscar?q=salud" },
  { label: "Hogar", Icon: House, href: "/buscar?q=hogar" },
  { label: "Automóviles", Icon: CarFront, href: "/buscar?q=automotriz" },
  { label: "Ver categorías", Icon: MoreHorizontal, href: "/categorias" },
];

export default function Hero() {
  return (
    <section className="ly-mobile-hero relative isolate overflow-hidden text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-[center_58%] lg:bg-center" style={{ backgroundImage: "url('/hero-plaza-kiosco.jpg')" }} />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#062b32]/95 via-[#073b43]/78 to-[#073b43]/25" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#062b32]/75 via-transparent to-[#062b32]/25" />

      <div className="relative mx-auto w-full max-w-[1600px] px-3 pb-3 pt-3 sm:px-8 sm:pb-6 sm:pt-7 lg:px-14 lg:pb-9 lg:pt-10">
        <div className="max-w-[760px]">
          <div className="mb-1.5 flex items-center gap-2 text-white/80">
            <Store size={13} strokeWidth={2.2} />
            <span className="text-[9px] font-extrabold uppercase tracking-[.17em] sm:text-[10px]">LinaresYa · Comercio local</span>
          </div>
          <h1 className="max-w-[620px] text-[1.38rem] font-extrabold leading-[1.08] tracking-[-.04em] text-white sm:text-4xl lg:text-5xl">
            Descubre negocios y servicios <span className="text-[#ff6472]">de Linares</span>
          </h1>

          <div className="relative z-20 mt-2.5 w-full max-w-[560px]">
            <SearchAutocomplete variant="hero" />
          </div>

          <nav aria-label="Categorías principales" className="ly-mobile-hero-pills mt-2.5">
            <div className="ly-mobile-hero-track">
              {[0, 1].map((copy) => (
                <div key={copy} className="ly-mobile-hero-category-group" aria-hidden={copy === 1}>
                  {CATEGORIAS.map(({ label, Icon, href }) => (
                    <a
                      key={label}
                      href={href}
                      tabIndex={copy === 1 ? -1 : 0}
                      className="inline-flex min-h-7 shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-[#073b43]/65 px-3 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:min-h-9 sm:px-3.5 sm:text-xs"
                    >
                      <Icon aria-hidden="true" size={12} strokeWidth={2.2} />
                      {label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}
