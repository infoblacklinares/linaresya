/**
 * Eventos de ficha (LY-005).
 *
 * Hasta ahora se guardaban 4 contadores por negocio por dia. Eso no puede
 * responder cuantas personas distintas visitaron, a que hora, ni de donde
 * llegaron: la hora y el origen se perdian al sumar. Esta capa define los
 * eventos, la sesion anonima y el origen, y vive aparte de la base para poder
 * probarla sin navegador ni Supabase.
 *
 * Privacidad: la sesion es un identificador al azar que vive en el navegador y
 * se olvida al cerrar la pestana. No identifica a una persona, no se cruza con
 * nada y no hay IP en ninguna parte. Del referer se guarda solo el dominio.
 */

/** Todo lo que se puede registrar de una ficha. */
export const EVENTOS_NEGOCIO = [
  "vista",
  "telefono",
  "whatsapp",
  "maps",
  "instagram",
  "facebook",
  "web",
  "compartir",
  "qr",
] as const;

export type EventoNegocio = (typeof EVENTOS_NEGOCIO)[number];

/**
 * Que cuenta como "accion generada" (LY-028).
 *
 * `vista` no es una accion: es la oportunidad. `qr` tampoco, porque es la
 * forma de llegar, no algo que el visitante haga en la ficha.
 */
export const EVENTOS_ACCION: readonly EventoNegocio[] = [
  "telefono",
  "whatsapp",
  "maps",
  "instagram",
  "facebook",
  "web",
  "compartir",
];

/** Los 4 que ademas siguen alimentando los contadores diarios de siempre. */
export const EVENTOS_HISTORICOS: readonly EventoNegocio[] = [
  "vista",
  "whatsapp",
  "telefono",
  "maps",
];

export function esEventoNegocio(valor: unknown): valor is EventoNegocio {
  return typeof valor === "string" && (EVENTOS_NEGOCIO as readonly string[]).includes(valor);
}

export function esAccion(evento: EventoNegocio): boolean {
  return EVENTOS_ACCION.includes(evento);
}

// --- UTM -------------------------------------------------------------------

export type Utm = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
};

export const UTM_VACIO: Utm = { source: null, medium: null, campaign: null, content: null };

/**
 * Limpia un valor de UTM: minuscula, sin espacios, solo caracteres seguros y
 * corto. Lo que viene en la URL lo escribe cualquiera, incluido un atacante.
 */
function limpiarUtm(valor: string | null | undefined): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.\-]/g, "")
    .slice(0, 40);
  return limpio || null;
}

type FuenteParams =
  | URLSearchParams
  | Record<string, string | null | undefined>;

function leer(params: FuenteParams, clave: string): string | null {
  if (typeof (params as URLSearchParams).get === "function") {
    return (params as URLSearchParams).get(clave);
  }
  return (params as Record<string, string | null | undefined>)[clave] ?? null;
}

export function normalizarUtm(params: FuenteParams): Utm {
  return {
    source: limpiarUtm(leer(params, "utm_source")),
    medium: limpiarUtm(leer(params, "utm_medium")),
    campaign: limpiarUtm(leer(params, "utm_campaign")),
    content: limpiarUtm(leer(params, "utm_content")),
  };
}

export function tieneUtm(utm: Utm | null | undefined): boolean {
  if (!utm) return false;
  return Boolean(utm.source || utm.medium || utm.campaign || utm.content);
}

// --- Origen de la visita ---------------------------------------------------

/** Solo el dominio del referer: la URL completa es dato de mas. */
export function hostDeReferer(referer: string | null | undefined): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).host.toLowerCase().replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

const HOSTS_CONOCIDOS: Array<[RegExp, string]> = [
  [/(^|\.)instagram\.com$|(^|\.)l\.instagram\.com$/, "instagram"],
  [/(^|\.)facebook\.com$|(^|\.)fb\.me$|(^|\.)l\.facebook\.com$/, "facebook"],
  [/(^|\.)google\./, "google"],
  [/(^|\.)bing\.com$|(^|\.)duckduckgo\.com$|(^|\.)search\.yahoo\.com$/, "buscador"],
  [/(^|\.)whatsapp\.com$|(^|\.)wa\.me$/, "whatsapp"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)linaresya\.cl$/, "linaresya"],
];

/**
 * De donde llego la visita. Manda el `utm_source` si vino: es lo que nosotros
 * pusimos en el link de la publicacion. Si no, se deduce del dominio que
 * refirio. Sin ninguno de los dos, es "directo" (escribio la direccion, la
 * tenia guardada, o el navegador no manda referer).
 */
export function fuenteDesde(opciones: {
  utm?: Utm | null;
  refererHost?: string | null;
  hostPropio?: string;
}): string {
  const { utm, refererHost, hostPropio = "linaresya.cl" } = opciones;
  if (utm?.source) return utm.source;

  const host = (refererHost ?? "").toLowerCase().replace(/^www\./, "");
  if (!host) return "directo";
  if (host === hostPropio.toLowerCase().replace(/^www\./, "")) return "interno";

  for (const [patron, nombre] of HOSTS_CONOCIDOS) {
    if (patron.test(host)) return nombre;
  }
  // Un dominio desconocido igual sirve: se guarda tal cual, acotado.
  return host.slice(0, 40);
}

// --- Sesion anonima --------------------------------------------------------

/**
 * Identificador de sesion: 24 caracteres al azar, sin relacion con la persona.
 *
 * Se genera en el navegador y se guarda mientras la pestana viva (LY-030). Dos
 * visitas de la misma persona en dias distintos son dos sesiones: "visitante
 * unico" en LinaresYa significa **una sesion de navegador**, y asi hay que
 * decirlo en el panel para no prometer lo que no se mide.
 */
export function nuevaSesion(azar?: () => number): string {
  const alfabeto = "abcdefghijklmnopqrstuvwxyz0123456789";
  const rnd =
    azar ??
    (() => {
      const c = (globalThis as { crypto?: Crypto }).crypto;
      if (c && typeof c.getRandomValues === "function") {
        const buf = new Uint32Array(1);
        c.getRandomValues(buf);
        return buf[0] / 2 ** 32;
      }
      return Math.random();
    });
  let salida = "";
  for (let i = 0; i < 24; i++) {
    salida += alfabeto[Math.floor(rnd() * alfabeto.length)] ?? "0";
  }
  return salida;
}

/** Una sesion valida: lo que llega por la API puede ser cualquier cosa. */
export function esSesionValida(valor: unknown): boolean {
  return typeof valor === "string" && /^[a-z0-9]{24}$/.test(valor);
}
