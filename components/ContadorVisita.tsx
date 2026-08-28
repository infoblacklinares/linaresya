"use client";

import { useEffect } from "react";

const CLAVE = "linaresya_visita_contada";

/**
 * Cuenta una visita a la portada, para tener el denominador del embudo del
 * popup: sin esto, saber que N personas lo vieron no dice nada, porque no se
 * distingue "vino poca gente" de "vino mucha y el popup no aparece".
 *
 * Una sola vez por sesion del navegador, no por carga: ir y volver a la
 * portada no infla el numero. Es un contador agregado por dia, sin cookies ni
 * nada que identifique a nadie.
 *
 * Al ser un efecto de cliente, los bots que no ejecutan JS no cuentan, y los
 * prefetch de Next tampoco: solo corre cuando la pagina se monta de verdad.
 */
export default function ContadorVisita() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLAVE) === "1") return;
      sessionStorage.setItem(CLAVE, "1");
    } catch {
      // Sin sessionStorage contamos igual: mejor de mas que de menos.
    }

    const cuerpo = JSON.stringify({ evento: "visita_portada" });
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
      /* una metrica nunca puede romper la portada */
    }
  }, []);

  return null;
}
