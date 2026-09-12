"use client";

/**
 * Envio de eventos desde el navegador (LY-005).
 *
 * Guarda en la pestana una sesion al azar y el origen con el que la persona
 * llego (UTM o dominio que refirio), y los manda con cada evento. Asi se puede
 * saber cuantas personas distintas visitaron una ficha y de que publicacion
 * venian, algo que los contadores por dia no podian responder.
 *
 * Nada de esto identifica a nadie: la sesion es azar puro, se olvida al cerrar
 * la pestana y no viaja ninguna IP.
 *
 * Si algo falla (sessionStorage bloqueado, sin red, beacon no soportado), el
 * evento se pierde en silencio. La analitica nunca puede romper un click.
 */

import {
  fuenteDesde,
  hostDeReferer,
  normalizarUtm,
  nuevaSesion,
  UTM_VACIO,
  type EventoNegocio,
  type Utm,
} from "@/lib/eventos";

const CLAVE = "linaresya_origen";

type Contexto = {
  sesion: string;
  fuente: string;
  utm: Utm;
  refererHost: string | null;
};

// Respaldo cuando sessionStorage esta bloqueado (modo privado): al menos
// dentro de esta carga todos los eventos comparten la misma sesion.
let enMemoria: Contexto | null = null;

function crearContexto(): Contexto {
  const utm =
    typeof window !== "undefined"
      ? normalizarUtm(new URLSearchParams(window.location.search))
      : UTM_VACIO;
  const refererHost =
    typeof document !== "undefined" ? hostDeReferer(document.referrer) : null;
  return {
    sesion: nuevaSesion(),
    // El origen se calcula una sola vez, al entrar: es de donde vino la
    // persona. Si se recalculara en cada click, todo terminaria como "interno".
    fuente: fuenteDesde({ utm, refererHost }),
    utm,
    refererHost,
  };
}

/** La sesion y el origen de esta visita. Se crea la primera vez que se usa. */
export function contextoDeSesion(): Contexto {
  if (enMemoria) return enMemoria;

  try {
    const guardado = sessionStorage.getItem(CLAVE);
    if (guardado) {
      const parseado = JSON.parse(guardado) as Contexto;
      if (parseado?.sesion) {
        enMemoria = parseado;
        return parseado;
      }
    }
  } catch {
    // Sin sessionStorage se sigue con el respaldo en memoria.
  }

  const contexto = crearContexto();
  enMemoria = contexto;
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(contexto));
  } catch {
    // Da igual: ya quedo en memoria para esta carga.
  }
  return contexto;
}

/** Manda un evento de ficha. Nunca lanza, nunca bloquea la navegacion. */
export function enviarEvento(negocioId: string, evento: EventoNegocio): void {
  try {
    const ctx = contextoDeSesion();
    const cuerpo = JSON.stringify({
      negocio_id: negocioId,
      evento,
      sesion: ctx.sesion,
      fuente: ctx.fuente,
      datos: {
        utm_source: ctx.utm.source,
        utm_medium: ctx.utm.medium,
        utm_campaign: ctx.utm.campaign,
        utm_content: ctx.utm.content,
        campana: ctx.utm.campaign,
        referer_host: ctx.refererHost,
      },
    });

    // sendBeacon es a prueba de navegacion: el evento sale aunque la pagina se
    // este yendo, que es exactamente lo que pasa al tocar "Llamar".
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([cuerpo], { type: "application/json" });
      if (navigator.sendBeacon("/api/track", blob)) return;
    }
    void fetch("/api/track", {
      method: "POST",
      body: cuerpo,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  } catch {
    // La analitica nunca rompe la accion principal.
  }
}
