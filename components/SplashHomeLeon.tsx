"use client";

import { useCallback, useEffect, useState } from "react";
import SplashLeon from "./SplashLeon";

const CLAVE = "linaresya_splash_leon_visto";
// La escena esta escrita para 9.8s. A 3.9 dura ~2.5s: sigue leyendose
// "linaresya.cl" (~0.7s en pantalla) sin cobrarle 3.5s a cada visita.
const VELOCIDAD = 3.9;
const FADE_MS = 420;

/**
 * Capa de bienvenida de la portada con el leon.
 *
 * Reglas pensadas para no estorbar:
 *  - Se muestra UNA sola vez por sesion del navegador (sessionStorage).
 *    LinaresYa se usa con apuro ("a que hora cierra la farmacia"), asi que
 *    repetir la animacion en cada consulta la convierte en un peaje.
 *  - Dura ~2.5s y se desvanece sola.
 *  - Se puede saltar tocando la pantalla o con Escape.
 *  - Si el sistema pide reducir movimiento, muestra el fotograma final y cierra.
 *
 * La portada ya esta renderizada debajo: esto es solo una capa encima, no
 * retrasa la carga real ni afecta al SEO.
 */
export default function SplashHomeLeon() {
  // null = aun no sabemos (no renderizamos nada para evitar desajuste de
  // hidratacion, igual que en SplashHome).
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
    // sessionStorage no existe en el servidor: por eso el splash se decide
    // al montar y el primer render no pinta nada.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ver nota
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
      /* sin almacenamiento: se mostrara de nuevo, no es grave */
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
