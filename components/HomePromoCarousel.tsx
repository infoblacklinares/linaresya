"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    src: "/banners/linaresya-banner.webp",
    alt: "LinaresYa: todo Linares al alcance de tu mano",
    label: "Descubre LinaresYa",
    href: "/",
  },
  {
    src: "/banners/jatis-mutis-banner.webp",
    alt: "Jatis Mutis, sabores artesanales de Linares",
    label: "Conoce Jatis Mutis",
    href: "https://jatismutis.com",
  },
];

export default function HomePromoCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section aria-label="Marcas y promociones locales" className="relative overflow-hidden rounded-2xl bg-[#102d33] shadow-md">
      <div className="relative aspect-[16/7] min-h-[132px] w-full sm:aspect-[16/5] sm:min-h-[190px]">
        {slides.map((slide, index) => (
          <a
            key={slide.src}
            href={slide.href}
            target={slide.href.startsWith("http") ? "_blank" : undefined}
            rel={slide.href.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={slide.label}
            aria-hidden={active !== index}
            tabIndex={active === index ? 0 : -1}
            className={`absolute inset-0 block transition-opacity duration-700 ${active === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <img src={slide.src} alt={slide.alt} loading={index === 0 ? "eager" : "lazy"} className="h-full w-full object-contain" />
          </a>
        ))}
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Mostrar banner ${index + 1}: ${slide.label}`}
            aria-current={active === index}
            className={`h-1.5 rounded-full transition-all ${active === index ? "w-7 bg-white" : "w-2 bg-white/60"}`}
          />
        ))}
      </div>
    </section>
  );
}
