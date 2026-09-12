/**
 * Filtros de la peticion para el tracking (P0 del registro de arquitectura).
 *
 * Tres preguntas, las tres puras y con tests:
 *   - esBot(userAgent)            ¿lo pide un navegador de verdad?
 *   - mismoOrigen(...)            ¿viene de linaresya.cl o de un script suelto?
 *   - claveLimite(ip, salt)       ¿con que clave lo limitamos, sin guardar la IP?
 *
 * Sin dependencias del framework: asi corren los tests con node --test.
 */

import { createHash } from "node:crypto";

/**
 * Bots, crawlers y clientes de linea de comandos.
 *
 * La lista vieja solo miraba crawlers de buscadores y redes, asi que `curl`
 * contaba como visita: los barridos de auditoria del 2026-09-11 sumaron 346
 * visitas falsas a fichas reales. Lo que no es un navegador, no es una visita.
 */
const BOT_RE =
  /bot|crawler|spider|crawl|googlebot|bingbot|yandex|baidu|duckduck|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|discord|preview|fetch|curl|wget|python|httpie|postman|insomnia|axios|node-fetch|okhttp|java\/|go-http|libwww|scrapy|headless|phantom|puppeteer|playwright|lighthouse|pagespeed|uptime|monitor|pingdom|semrush|ahrefs|mj12|dotbot/i;

/**
 * Un user-agent vacio tambien se descarta: todo navegador manda uno, y los
 * scripts hechos a mano suelen no mandarlo.
 */
export function esBot(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? "").trim();
  if (!ua) return true;
  return BOT_RE.test(ua);
}

/**
 * Acepta la peticion solo si viene de nuestro propio sitio.
 *
 * Se mira Origin y, si no viene, Referer. En desarrollo se permite localhost
 * para poder probar sin desplegar.
 */
export function mismoOrigen(opciones: {
  origin?: string | null;
  referer?: string | null;
  siteUrl?: string | null;
  permitirLocal?: boolean;
}): boolean {
  const { origin, referer, siteUrl, permitirLocal = false } = opciones;
  const candidato = (origin || referer || "").trim();
  if (!candidato) return false;

  let host: string;
  try {
    host = new URL(candidato).host.toLowerCase();
  } catch {
    return false;
  }

  if (permitirLocal && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host)) {
    return true;
  }

  const permitidos = new Set<string>();
  if (siteUrl) {
    try {
      permitidos.add(new URL(siteUrl).host.toLowerCase());
    } catch {
      // siteUrl mal configurada: se ignora y quedan los dominios de abajo.
    }
  }
  permitidos.add("linaresya.cl");
  permitidos.add("www.linaresya.cl");

  if (permitidos.has(host)) return true;
  // Previews de Vercel del propio proyecto.
  return /^linaresya[a-z0-9-]*\.vercel\.app$/.test(host);
}

/**
 * Clave para limitar por origen sin guardar la IP.
 *
 * Se guarda un hash truncado, no la direccion: alcanza para frenar a quien
 * repite, y no es un dato personal almacenado (Ley 21.719). Sin IP, todos los
 * anonimos comparten la clave "sin-ip", que es el peor caso y sigue limitado.
 */
export function claveLimite(ip: string | null | undefined, salt: string): string {
  const base = (ip ?? "").trim();
  if (!base) return "sin-ip";
  return createHash("sha256").update(`${salt}:${base}`).digest("hex").slice(0, 32);
}

/** La IP del visitante segun las cabeceras de Vercel. Solo para la clave. */
export function ipDeCabeceras(cabeceras: {
  xForwardedFor?: string | null;
  xRealIp?: string | null;
}): string | null {
  const xff = (cabeceras.xForwardedFor ?? "").split(",")[0]?.trim();
  if (xff) return xff;
  const real = (cabeceras.xRealIp ?? "").trim();
  return real || null;
}
