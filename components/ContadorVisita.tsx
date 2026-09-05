"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { rutaSinPopup } from "@/lib/popup-rutas";

const CLAVE = "linaresya_visita_contada";

// Respaldo para cuando sessionStorage esta bloqueado (modo privado, cookies de
// terceros apagadas): sin esto el contador dispararia en cada navegacion,
// porque no tiene donde recordar que ya conto. Se pierde al recargar, que es
// justo lo que queremos: una por sesion, aproximada, nunca una por click.
let contadaEnEstaCarga = false;

/**
 * Cuenta una visita al sitio, para tener el denominador del embudo del popup:
 * sin esto, saber que N personas lo vieron no dice nada, porque no se
 * distingue "vino poca gente" de "vino mucha y el popup no aparece".
 *
 * Cuenta en las mismas rutas donde el popup puede aparecer, no solo en la
 * portada. Antes vivia en app/page.tsx y contaba solo a quien entraba por la
 * home, mientras el popup se mostraba tambien en categorias, fichas y
 * busquedas: el denominador quedaba mas chico que el numerador y la division
 * daba cualquier cosa (la semana del 28/08: 9 vistos contra 2 visitas).
 *
 * Una sola vez por sesion del navegador, no por carga: navegar por el sitio no
 * infla el numero. Depende del pathname para poder contar la primera ruta
 * elegible aunque la sesion haya empezado en una excluida (entrar por
 * /publicar y despues ir a la portada). Es un contador agregado por dia, sin
 * cookies ni nada que identifique a nadie.
 *
 * Al ser un efecto de cliente, los bots que no ejecutan JS no cuentan, y los
 * prefetch de Next tampoco: solo corre cuando la pagina se monta de verdad.
 */
export default function ContadorVisita() {
  const pathname = usePathname();

  useEffect(() => {
    if (rutaSinPopup(pathname)) return;

    if (contadaEnEstaCarga) return;
    contadaEnEstaCarga = true;

    try {
      if (sessionStorage.getItem(CLAVE) === "1") return;
      sessionStorage.setItem(CLAVE, "1");
    } catch {
      // Sin sessionStorage contamos igual: mejor de mas que de menos.
    }

    const cuerpo = JSON.stringify({ evento: "visita_sitio" });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([cuerpo], { type: "text/plain" }));
        return;
      }
      void fetch("/api/track", {
        method: "POST",
        body: cuerpo,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});
    } catch {
      /* una metrica nunca puede romper la navegacion */
    }
  }, [pathname]);

  return null;
}
