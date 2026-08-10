"use client";

import { useCallback, useEffect, useState } from "react";
import SplashAnimado from "./SplashAnimado";

const CLAVE = "linaresya_splash_visto";
const VELOCIDAD = 1.9; // escena de 3s comprimida a ~1.6s
const FADE_MS = 420;

/**
 * Splash de bienvenida de la portada.
 *
 * Reglas pensadas para no estorbar:
 *  - Se muestra UNA sola vez por sesión del navegador (sessionStorage).
 *  - Dura ~1.6s y se desvanece solo.
 *  - Se puede saltar tocando la pantalla.
 *  - Si el sistema pide reducir movimiento, no se anima.
 *
 * El contenido de la portada ya está renderizado debajo: esto es solo una
 * capa encima, así que no retrasa la carga real ni afecta al SEO.
 */
export default function SplashHome() {
  // null = aún no sabemos (no renderizamos nada para evitar desajuste de hidratación)
  const [mostrar, setMostrar] = useState<boolean | null>(null);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    let visto = false;
    try {
      visto = sessionStorage.getItem(CLAVE) === "1";
    } catch {
      // sin sessionStorage (modo restringido): mejor no mostrarlo
      visto = true;
    }
    setMostrar(!visto);
    if (!visto) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const cerrar = useCallback(() => {
    setSaliendo(true);
    try {
      sessionStorage.setItem(CLAVE, "1");
    } catch {
      /* sin almacenamiento: se mostrará de nuevo, no es grave */
    }
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
      aria-label="Saltar animación de bienvenida"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") cerrar();
      }}
      className="fixed inset-0 cursor-pointer transition-opacity"
      style={{
        // z-index en estilo directo: las clases z-[…] arbitrarias no se
        // generan de forma fiable en este proyecto y el splash quedaría
        // por debajo del hero (z-40) y del buscador (z-60).
        zIndex: 200,
        opacity: saliendo ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
      }}
    >
      <SplashAnimado bg="#eae9e4" velocidad={VELOCIDAD} onFin={cerrar} />
      <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-[#8E8279]">
        Toca para saltar
      </span>
    </div>
  );
}
