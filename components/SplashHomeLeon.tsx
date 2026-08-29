"use client";

import { useCallback, useEffect, useState } from "react";
import SplashLeon from "./SplashLeon";

const VELOCIDAD = 2.8; // escena de 9.8s comprimida a ~3.5s
const FADE_MS = 420;

/**
 * Capa de bienvenida de la portada con el leon.
 *
 * Reglas:
 *  - Se muestra CADA vez que se abre la portada (no usa sessionStorage).
 *  - Se puede saltar tocando la pantalla o con Escape.
 *  - Si el sistema pide reducir movimiento, muestra el fotograma final y cierra.
 *
 * La portada ya esta renderizada debajo: esto es solo una capa encima, no
 * retrasa la carga real ni afecta al SEO.
 */
export default function SplashHomeLeon() {
  // null = primer render en el servidor: no pintamos nada para evitar
  // desajuste de hidratacion, igual que en SplashHome.
  const [mostrar, setMostrar] = useState<boolean | null>(null);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    // sessionStorage/DOM no existen en el servidor: el splash se decide al
    // montar, por eso el primer render no pinta nada.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ver nota
    setMostrar(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const cerrar = useCallback(() => {
    setSaliendo(true);
    setTimeout(() => {
      setMostrar(false);
      document.body.style.overflow = "";
    }, FADE_MS);
  }, []);

  if (!mostrar) return null;

  return (
    <div
      onClick={cerrar}
      role="button"
      tabIndex={0}
      aria-label="Saltar animacion de bienvenida"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") cerrar();
      }}
      className="fixed inset-0 cursor-pointer transition-opacity"
      style={{
        // z-index en estilo directo: las clases z-[…] arbitrarias no se generan
        // de forma fiable en este proyecto y el splash quedaria por debajo del
        // hero (z-40) y del buscador (z-60).
        zIndex: 200,
        opacity: saliendo ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
      }}
    >
      <SplashLeon velocidad={VELOCIDAD} onFin={cerrar} />
      <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-[#8E8279]">
        Toca para saltar
      </span>
    </div>
  );
}
