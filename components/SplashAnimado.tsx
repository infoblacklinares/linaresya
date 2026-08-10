"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Splash animado de LinaresYa.
 *
 * Réplica de la escena diseñada en Claude Design ("LinaresYa Splash"):
 *   0.00s  el pin cae desde arriba con rebote (easeOutBack) y escala 0.6 -> 1
 *   0.50s  aparece la sombra bajo el pin y crece (easeOutCubic)
 *   0.55s  anillo de impacto que se expande y se desvanece
 *   1.10s  el pin queda "respirando" (oscilación sutil)
 *   1.15s  el logotipo salta desde abajo (easeOutBack)
 *   ~3.0s  fin de la escena
 *
 * Usa el pin y la marca del propio sitio (SVG + texto), no imágenes externas.
 * Respeta prefers-reduced-motion: en ese caso muestra el resultado final fijo.
 */

const DURACION_ESCENA = 3;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

export default function SplashAnimado({
  onFin,
  bg = "#eae9e4",
}: {
  onFin?: () => void;
  bg?: string;
}) {
  const [t, setT] = useState(0);
  const rafRef = useRef(0);
  const finRef = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setT(DURACION_ESCENA);
      onFin?.();
      return;
    }

    const inicio = performance.now();
    const tick = (ahora: number) => {
      const seg = (ahora - inicio) / 1000;
      setT(seg);
      if (seg < DURACION_ESCENA) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!finRef.current) {
        finRef.current = true;
        onFin?.();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onFin]);

  // ── Pin: caída con rebote ───────────────────────────────────────────
  const dropDur = 1.1;
  const dropT = clamp(t / dropDur, 0, 1);
  const y = -460 + 460 * easeOutBack(dropT);
  const scale = 0.6 + 0.4 * clamp(t / 0.5, 0, 1);
  const breathe = 1 + Math.sin(t * 1.6) * 0.012 * (t > dropDur ? 1 : 0);

  // ── Sombra ──────────────────────────────────────────────────────────
  const shadowT = clamp((t - 0.5) / 0.5, 0, 1);
  const shadowScale = 0.3 + 0.7 * easeOutCubic(shadowT);
  const shadowOpacity = 0.16 * shadowT;

  // ── Anillo de impacto ───────────────────────────────────────────────
  const impactT = clamp((t - 0.55) / 0.6, 0, 1);
  const impactEase = easeOutCubic(impactT);
  const ringScale = 0.3 + 1.4 * impactEase;
  const ringOpacity = impactT <= 0 ? 0 : 0.35 * (1 - impactEase);

  // ── Resplandor de fondo ─────────────────────────────────────────────
  const glowOpacity = 0.5 * clamp(t / 0.6, 0, 1);

  // ── Logotipo ────────────────────────────────────────────────────────
  const textDelay = 1.15;
  const textDur = 0.5;
  const textT = clamp((t - textDelay) / textDur, 0, 1);
  const textEase = easeOutBack(textT);
  const textOpacity = clamp((t - textDelay) / (textDur * 0.7), 0, 1);
  const textY = 22 - 22 * textEase;
  const textScale = 0.85 + 0.15 * textEase;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: bg }}
    >
      {/* Resplandor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: "min(78vw, 620px)",
          height: "min(78vw, 620px)",
          opacity: glowOpacity,
          background:
            "radial-gradient(circle, rgba(192,90,70,0.22) 0%, rgba(192,90,70,0) 70%)",
          transform: "translateY(-6vh)",
        }}
      />

      {/* Anillo de impacto */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: "min(38vw, 300px)",
          height: "min(38vw, 300px)",
          border: "3px solid rgba(26,20,16,0.5)",
          opacity: ringOpacity,
          transform: `translateY(15vh) scale(${ringScale}, ${ringScale * 0.42})`,
        }}
      />

      {/* Sombra */}
      <div
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          width: "min(46vw, 360px)",
          height: 70,
          background: "#1a1410",
          opacity: shadowOpacity,
          transform: `translateY(16vh) scale(${shadowScale}, ${shadowScale * 0.5})`,
          filter: "blur(14px)",
        }}
      />

      {/* Pin */}
      <div
        style={{
          transform: `translateY(${y}px) scale(${scale * breathe})`,
          width: "min(42vw, 260px)",
        }}
      >
        <svg viewBox="0 0 24 24" className="block h-full w-full" aria-hidden="true">
          <path
            d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z"
            fill="#2B6E80"
          />
          <circle cx="12" cy="10" r="3.1" fill="#ffffff" />
        </svg>
      </div>

      {/* Logotipo */}
      <div
        className="mt-3"
        style={{
          opacity: textOpacity,
          transform: `translateY(${textY}px) scale(${textScale})`,
        }}
      >
        <span
          className="font-black tracking-tight text-[#1A1410]"
          style={{ fontSize: "clamp(2rem, 9vw, 4.5rem)" }}
        >
          Linares<span className="text-[#F4B860]">Ya</span>
        </span>
      </div>
    </div>
  );
}
