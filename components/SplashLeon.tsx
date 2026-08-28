"use client";

import { useEffect, useRef, useState } from "react";
import { LEON } from "@/lib/leon-paths";

/**
 * Splash animado del leon de LinaresYa.
 *
 * Escena (tiempo autoral, 9.8s a velocidad 1):
 *   0.0s  Destello  la estrella dorada nace en el negro y late
 *   1.0s  Zarpazo   cuatro garras rasgan la pantalla, la luz sale por los cortes
 *   2.2s  Trazo     el contorno del leon se dibuja solo, de la cola a la melena
 *   4.6s  Relleno   el oro entra en la silueta y un barrido de luz la cruza
 *   6.0s  Marca     el logo sube y aparece linaresya.cl
 *   8.2s  Cierre    respiracion y fundido a negro
 *
 * Todo va dentro de un SVG 1080x1920 con preserveAspectRatio="slice",
 * asi la escena se adapta a cualquier pantalla sin recalcular nada.
 * Respeta prefers-reduced-motion: salta al fotograma final.
 */

const SCENES: [string, number][] = [
  ["destello", 1.0],
  ["zarpazo", 1.2],
  ["trazo", 2.4],
  ["relleno", 1.4],
  ["marca", 2.2],
  ["cierre", 1.6],
];

const CUE: Record<string, number> = {};
let acc = 0;
for (const [name, dur] of SCENES) {
  CUE[name] = acc;
  acc += dur;
}
const TOTAL = acc;

const W = 1080;
const H = 1920;
const GOLD = "#FFD16A";

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOutQuad = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

const ramp =
  (from: number, to: number, start: number, end: number, ease = easeOutCubic) =>
  (t: number) =>
    from + (to - from) * ease(clamp((t - start) / (end - start), 0, 1));

const CLAWS = [
  { off: -232, len: 1420, w: 30, bow: -86 },
  { off: -74, len: 1620, w: 46, bow: -104 },
  { off: 88, len: 1560, w: 40, bow: -96 },
  { off: 246, len: 1300, w: 24, bow: -78 },
];

export default function SplashLeon({
  onFin,
  velocidad = 2.8,
  tagline = "linaresya.cl",
  subtitulo = "Directorio local de Linares",
}: {
  onFin?: () => void;
  /** Multiplicador de tiempo. 1 = escena completa (9.8s). 2.8 ~ 3.5s. */
  velocidad?: number;
  tagline?: string;
  subtitulo?: string;
}) {
  const [tReal, setTReal] = useState(0);
  const T = tReal * velocidad;
  const rafRef = useRef(0);
  const finRef = useRef(false);

  useEffect(() => {
    const finalReal = TOTAL / velocidad;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // matchMedia solo existe en el navegador: saltamos al fotograma final
      // en cuanto sabemos que el usuario pidio menos movimiento.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ver nota
      setTReal(CUE.cierre / velocidad);
      onFin?.();
      return;
    }
    const inicio = performance.now();
    const tick = (ahora: number) => {
      const seg = (ahora - inicio) / 1000;
      setTReal(seg);
      if (seg < finalReal) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!finRef.current) {
        finRef.current = true;
        onFin?.();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onFin, velocidad]);

  // Destello
  const starIn = ramp(0, 1, CUE.destello + 0.1, CUE.destello + 0.8, easeOutBack)(T);
  const starSpin = ramp(-60, 0, CUE.destello + 0.1, CUE.destello + 1.0)(T);
  const starPulse = 1 + 0.12 * Math.sin((T - CUE.destello) * 3.4);
  const starGlow = ramp(1, 0.35, CUE.trazo, CUE.trazo + 0.9)(T);

  // Zarpazo
  const firstHit = CUE.zarpazo + 0.08;
  const clawFade = ramp(1, 0, CUE.zarpazo + 0.62, CUE.zarpazo + 1.12)(T);
  const clawSpread = ramp(1, 1.14, CUE.zarpazo + 0.1, CUE.zarpazo + 1.12)(T);
  const flash = ramp(0.26, 0, firstHit, firstHit + 0.18)(T);
  const dt = T - firstHit;
  const shake = dt > 0 && dt < 0.9 ? Math.exp(-dt * 6.5) * 20 * Math.sin(dt * 48) : 0;

  // Trazo
  const n = LEON.draw.length;
  const drawSpan = (CUE.relleno - CUE.trazo) * 0.92;
  const per = drawSpan * 0.34;
  const step = (drawSpan - per) / (n - 1);

  // Relleno
  const fill = ramp(0, 1, CUE.relleno, CUE.relleno + 0.85)(T);
  const strokeFade = ramp(1, 0, CUE.relleno + 0.15, CUE.relleno + 0.7)(T);
  const shine = ramp(-0.6, 1.6, CUE.relleno + 0.35, CUE.marca + 0.35)(T);

  // Camara
  const zoom = ramp(1.09, 1.0, CUE.trazo, CUE.cierre)(T);
  const breathe = 1 + 0.008 * Math.sin((T - CUE.marca) * 1.6);
  const lift = ramp(0, -70, CUE.marca, CUE.marca + 1.0)(T);

  // Marca
  const txtIn = ramp(0, 1, CUE.marca + 0.25, CUE.marca + 1.0)(T);
  const txtY = ramp(46, 0, CUE.marca + 0.25, CUE.marca + 1.1)(T);
  const ruleW = ramp(0, 1, CUE.marca + 0.5, CUE.marca + 1.3)(T);
  const subIn = ramp(0, 1, CUE.marca + 0.8, CUE.marca + 1.5)(T);

  const outFade = ramp(1, 0, TOTAL - 0.55, TOTAL - 0.05)(T);
  const vig = ramp(0.15, 0.55, CUE.destello, CUE.marca)(T);

  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, background: "#0f0f10", overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(120% 80% at 50% 42%, rgba(255,180,90,${
            0.14 * (1 - vig)
          }) 0%, rgba(15,15,16,0) 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: outFade,
          transform: `translate(${shake}px, ${shake * 0.45}px)`,
        }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="lyGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF1C7" />
              <stop offset="42%" stopColor="#FFD16A" />
              <stop offset="75%" stopColor="#F5A43A" />
              <stop offset="100%" stopColor="#E86A2A" />
            </linearGradient>
            <linearGradient id="lyShine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fff" stopOpacity={0} />
              <stop offset="45%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="55%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#fff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lyClaw" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E86A2A" stopOpacity={0} />
              <stop offset="22%" stopColor="#FFD16A" stopOpacity={1} />
              <stop offset="58%" stopColor="#FFF1C7" stopOpacity={1} />
              <stop offset="100%" stopColor="#E86A2A" stopOpacity={0} />
            </linearGradient>
            <filter id="lyGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="14" result="b" />
              <feColorMatrix
                in="b"
                type="matrix"
                values="1 0 0 0 0  0 0.72 0 0 0  0 0 0.28 0 0  0 0 0 0.9 0"
              />
            </filter>
            <clipPath id="lyLeonClip">
              <path d={LEON.full} />
            </clipPath>
            {CLAWS.map((c, i) => {
              const t0 = firstHit + i * 0.075;
              const prog = ramp(0, 1, t0, t0 + 0.2)(T);
              return (
                <clipPath key={i} id={`lyClaw${i}`}>
                  <rect
                    x={-c.len / 2 - 20}
                    y={c.off + c.bow - 200}
                    width={(c.len + 40) * prog}
                    height={460}
                  />
                </clipPath>
              );
            })}
          </defs>

          <g
            transform={`translate(${W / 2} ${820 + lift}) scale(${zoom * breathe}) translate(${
              -961 / 2
            } ${-593 / 2})`}
          >
            <g opacity={0.55 * fill} filter="url(#lyGlow)">
              <path d={LEON.full} fill="url(#lyGold)" />
            </g>

            {LEON.draw.map((p, i) => {
              const s = CUE.relleno + i * 0.012;
              return (
                <path key={`f${i}`} d={p.d} fill="url(#lyGold)" opacity={ramp(0, 1, s, s + 0.5)(T)} />
              );
            })}

            {LEON.draw.map((p, i) => {
              const s = CUE.trazo + i * step;
              const prog = easeInOutQuad(clamp((T - s) / per, 0, 1));
              return (
                <path
                  key={`s${i}`}
                  d={p.d}
                  fill="none"
                  stroke={GOLD}
                  strokeWidth={p.g === "mane" ? 3.4 : 2.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - prog}
                  opacity={strokeFade * (prog > 0 ? 1 : 0)}
                />
              );
            })}

            <g opacity={fill}>
              <rect
                clipPath="url(#lyLeonClip)"
                x={-400 + shine * 1400}
                y={-60}
                width={320}
                height={720}
                fill="url(#lyShine)"
                opacity={0.55}
                transform="skewX(-18)"
              />
            </g>

            <g
              transform={`translate(496 71) rotate(${starSpin}) scale(${
                starIn * starPulse
              }) translate(-496 -71)`}
            >
              <g opacity={starGlow} filter="url(#lyGlow)">
                {LEON.star.map((d, i) => (
                  <path key={`sg${i}`} d={d} fill="#FFF1C7" />
                ))}
              </g>
              {LEON.star.map((d, i) => (
                <path key={`st${i}`} d={d} fill="url(#lyGold)" />
              ))}
            </g>
          </g>

          {/* Zarpazo */}
          <g opacity={clawFade} transform={`translate(${W / 2} 840) rotate(-64) scale(${clawSpread})`}>
            {CLAWS.map((c, i) => {
              const t0 = firstHit + i * 0.075;
              if (T < t0) return null;
              const d =
                `M ${-c.len / 2} ${c.off} ` +
                `Q 0 ${c.off + c.bow - c.w} ${c.len / 2} ${c.off} ` +
                `Q 0 ${c.off + c.bow + c.w} ${-c.len / 2} ${c.off} Z`;
              return (
                <g key={i}>
                  <path
                    d={d}
                    clipPath={`url(#lyClaw${i})`}
                    fill="url(#lyClaw)"
                    filter="url(#lyGlow)"
                    opacity={0.85}
                  />
                  <path
                    d={d}
                    clipPath={`url(#lyClaw${i})`}
                    fill="#FFF6DC"
                    transform={`scale(1 0.32) translate(0 ${c.off * 2.12})`}
                  />
                </g>
              );
            })}
          </g>

          {/* Marca */}
          <g opacity={txtIn} transform={`translate(0 ${txtY})`}>
            <rect x={(W - ruleW * 320) / 2} y={1210} width={ruleW * 320} height={3} fill={GOLD} opacity={0.9} />
            <text
              x={W / 2}
              y={1364}
              textAnchor="middle"
              fill="#F3F2F2"
              style={{
                fontFamily: "var(--font-display), var(--font-sans), system-ui, sans-serif",
                fontSize: 86,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              {tagline}
            </text>
            <text
              x={W / 2}
              y={1444}
              textAnchor="middle"
              fill="rgba(243,242,242,0.62)"
              opacity={subIn}
              style={{
                fontFamily: "var(--font-sans), system-ui, sans-serif",
                fontSize: 38,
                fontWeight: 400,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {subtitulo}
            </text>
          </g>
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#FFF6DC",
          opacity: flash,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
