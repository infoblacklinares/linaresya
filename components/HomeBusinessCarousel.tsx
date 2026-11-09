"use client";

import Link from "next/link";
import { BadgeCheck, MapPin, ArrowRight } from "lucide-react";

export type HomeBusinessSlide = {
  id: string;
  nombre: string;
  slug: string;
  categoriaSlug: string;
  categoriaNombre: string;
  descripcion: string | null;
  foto: string;
  premium: boolean;
  verificado: boolean;
};

export default function HomeBusinessCarousel({ slides }: { slides: HomeBusinessSlide[] }) {
  if (!slides.length) return null;

  return (
    <section className="ly-featured-section" aria-label="Negocios destacados">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-[#292521] sm:text-xl">Negocios destacados</h2>
          <p className="mt-1 text-xs text-[#858078]">Conoce emprendimientos y servicios de Linares</p>
        </div>
        <Link href="/buscar" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#d94a35]">Ver todos <ArrowRight size={14}/></Link>
      </div>
      <div className="ly-featured-grid">
        {slides.map((item) => (
          <article key={item.id} className="ly-featured-card">
            <Link href={item.categoriaSlug ? `/${item.categoriaSlug}/${item.slug}` : "/buscar"} className="block">
              <div className="ly-featured-photo">
                <img src={item.foto} alt={item.nombre} loading="lazy" />
                <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                  {item.premium && <span className="rounded-full bg-[#fff3d9] px-2 py-1 text-[9px] font-extrabold text-[#8b5b17]">DESTACADO</span>}
                  {item.verificado && <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold text-[#3d7658]"><BadgeCheck size={11}/> Verificado</span>}
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#d94a35]">{item.categoriaNombre || "Negocio local"}</span>
                <h3 className="mt-1 line-clamp-1 text-sm font-extrabold text-[#292521] sm:text-base">{item.nombre}</h3>
                <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-relaxed text-[#77736d] sm:text-xs">{item.descripcion || "Conoce este negocio local y descubre lo que ofrece."}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#d94a35]">Conocer negocio <ArrowRight size={13}/></span>
              </div>
            </Link>
            <span className="absolute right-2.5 top-[calc(100%-100%+10px)] hidden items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[9px] font-bold text-white"><MapPin size={10}/> Linares</span>
          </article>
        ))}
      </div>
    </section>
  );
}
