"use client";

import { useEffect, useRef } from "react";

/**
 * Carrusel horizontal con auto-scroll infinito y fluido.
 * - Duplica los hijos para lograr un loop sin cortes.
 * - Se pausa al pasar el mouse (desktop) o al tocar (mobile) para poder hacer clic.
 * - Sigue siendo scrolleable a mano (swipe / trackpad).
 * - Respeta prefers-reduced-motion (no auto-scroll, solo manual).
 */
export default function MarqueeRow({
  children,
  speed = 0.4,
}: {
  children: React.ReactNode;
  speed?: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return; // solo scroll manual

    let raf = 0;
    const step = () => {
      if (!pausedRef.current && el.scrollWidth > el.clientWidth) {
        // El primer grupo (mitad del contenido) marca el punto de loop.
        const firstGroup = el.firstElementChild as HTMLElement | null;
        const loopPoint = firstGroup ? firstGroup.getBoundingClientRect().width + 12 : el.scrollWidth / 2;
        el.scrollLeft += speed;
        if (el.scrollLeft >= loopPoint) {
          el.scrollLeft -= loopPoint;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  return (
    <div
      ref={scrollerRef}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onPointerDown={pause}
      onPointerUp={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2"
    >
      <div className="flex gap-3 shrink-0">{children}</div>
      <div className="flex gap-3 shrink-0" aria-hidden="true">{children}</div>
    </div>
  );
}
