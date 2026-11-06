"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Store } from "lucide-react";

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
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const previous = () => setActive((current) => (current - 1 + slides.length) % slides.length);
  const next = () => setActive((current) => (current + 1) % slides.length);

  if (slides.length === 0) {
    return (
      <section className="px-3 pt-4 sm:px-6" aria-label="Descubre negocios de Linares">
        <div className="relative flex min-h-[220px] items-end overflow-hidden rounded-[1.5rem] bg-[#073b43] p-5 text-white shadow-lg sm:min-h-[300px] sm:p-8">
          <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: "url('/hero-plaza-kiosco.jpg')" }} />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#062b32]/95 via-[#073b43]/70 to-transparent" />
          <div className="relative max-w-md">
            <span className="text-xs font-bold uppercase tracking-[.16em] text-white/75">Comercio local</span>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-4xl">Descubre los negocios de Linares</h2>
            <p className="mt-2 text-sm text-white/85">Encuentra comercios y servicios de tu ciudad en un solo lugar.</p>
            <Link href="/buscar" className="mt-4 inline-flex min-h-10 items-center rounded-full bg-[#f51e4e] px-5 text-sm font-bold text-white">Explorar negocios <span className="ml-2">→</span></Link>
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[active];
  const href = slide.categoriaSlug ? `/${slide.categoriaSlug}/${slide.slug}` : "/buscar";

  return (
    <section className="px-3 pt-4 sm:px-6 sm:pt-6" aria-label="Negocios destacados" aria-roledescription="carrusel">
      <div className="relative min-h-[230px] overflow-hidden rounded-[1.5rem] bg-[#102d3b] shadow-[0_12px_32px_rgba(16,45,59,.18)] sm:min-h-[330px]">
        {slides.map((item, index) => (
          <div key={item.id} aria-hidden={index !== active} className={`absolute inset-0 transition-opacity duration-700 ${index === active ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <img src={item.foto} alt="" className="absolute inset-0 h-full w-full object-cover" loading={index === 0 ? "eager" : "lazy"} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071d2b]/95 via-[#071d2b]/65 to-[#071d2b]/10" />
            <div className="relative flex min-h-[230px] max-w-[78%] flex-col items-start justify-end p-5 text-white sm:min-h-[330px] sm:max-w-[65%] sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-white/90 backdrop-blur">
                <Store size={12} /> {item.categoriaNombre || "Negocio local"}
              </span>
              <h2 className="mt-3 line-clamp-2 text-2xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl">{item.nombre}</h2>
              <p className="mt-2 line-clamp-2 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">{item.descripcion || "Conoce este negocio y descubre lo que ofrece en Linares."}</p>
              <Link href={item.categoriaSlug ? `/${item.categoriaSlug}/${item.slug}` : "/buscar"} tabIndex={index === active ? 0 : -1} className="mt-4 inline-flex min-h-10 items-center rounded-full bg-[#f51e4e] px-5 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#df1743]">
                Conocer negocio <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <>
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 sm:bottom-6 sm:right-6">
              <button type="button" onClick={previous} aria-label="Negocio anterior" className="grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur transition hover:bg-black/50"><ChevronLeft size={18} /></button>
              <button type="button" onClick={next} aria-label="Siguiente negocio" className="grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur transition hover:bg-black/50"><ChevronRight size={18} /></button>
            </div>
            <div className="absolute bottom-5 left-5 z-10 flex items-center gap-1.5 sm:bottom-7 sm:left-8">
              {slides.map((item, index) => (
                <button key={item.id} type="button" onClick={() => setActive(index)} aria-label={`Mostrar negocio ${index + 1}: ${item.nombre}`} aria-current={index === active ? "true" : undefined} className={`h-1.5 rounded-full transition-all ${index === active ? "w-7 bg-white" : "w-1.5 bg-white/55 hover:bg-white"}`} />
              ))}
            </div>
          </>
        )}
        <span className="absolute right-4 top-4 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur"><MapPin size={11} className="mr-1 inline" /> Linares</span>
      </div>
    </section>
  );
}
