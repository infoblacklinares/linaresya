"use client";

import SearchAutocomplete from "@/components/SearchAutocomplete";
import { MapPin } from "lucide-react";

interface HeroProps {
  totalNegocios?: number;
  abiertosAhora?: number;
  verificados?: number;
}

export default function Hero({ totalNegocios = 0 }: HeroProps) {
  return (
    <header className="ly-home-header">
      <div className="ly-home-header-inner">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#8a8a83]">
              <MapPin size={12} className="text-[#df4b35]" /> LinaresYa · Comercio local
            </div>
            <h1 className="max-w-[620px] text-[1.65rem] font-extrabold leading-[1.04] tracking-[-.045em] text-[#25221f] sm:text-3xl lg:text-4xl">
              Descubre lo mejor de <span className="text-[#df4b35]">Linares.</span>
            </h1>
            <p className="mt-1.5 text-xs text-[#77736d] sm:text-sm">Negocios, servicios y lugares cerca de ti.</p>
          </div>
          <div className="ly-home-avatar" aria-label="LinaresYa">LY</div>
        </div>
        <div className="mt-4">
          <SearchAutocomplete variant="hero" />
        </div>
      </div>
    </header>
  );
}
