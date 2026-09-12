/**
 * Contactos del negocio: telefono, WhatsApp, Facebook y sitio web (LY-003).
 *
 * Un solo lugar para normalizar lo que se guarda y para armar los links que
 * se muestran. Antes cada formulario (publicar, admin, dueño) tenia su propia
 * copia de normalizarWhatsApp y cada pagina armaba el wa.me a su manera: el
 * banner de premium llegaba a escribir `wa.me/5656...`.
 *
 * Instagram vive aparte en lib/instagram.ts.
 *
 * Formatos que se guardan:
 *   telefono  "+56912345678" / "+56732211234"  (600 y 800 sin +56: "6003600000")
 *   whatsapp  "56912345678"                    (sin +, como lo pide wa.me)
 *   facebook  "https://www.facebook.com/pagina"
 *   sitio_web "https://minegocio.cl/"
 *
 * Los links toleran datos viejos guardados en otro formato: un telefono que no
 * calza con ninguna regla igual se puede marcar, en vez de esconder el boton.
 */

export type ResultadoContacto =
  | { ok: true; valor: string | null }
  | { ok: false; error: string };

/** Mensaje inicial del boton WhatsApp de la ficha. */
export const MENSAJE_WHATSAPP =
  "Hola, encontré tu negocio en LinaresYa y quisiera consultar.";

// Numeros 600 (10 digitos) y 800 (9 digitos): solo se marcan dentro de Chile,
// sin codigo de pais.
const ESPECIAL_RE = /^(600\d{7}|800\d{6})$/;

// 9 digitos sin el 56: celular (9XXXXXXXX), Santiago (2XXXXXXXX) o fijo de
// region con codigo de area de 2 digitos (73 para Linares).
const NACIONAL_RE = /^[2-9]\d{8}$/;

function digitos(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^00/, "");
}

/**
 * Los 9 digitos nacionales: saca el 56 si el numero venia completo (56 + 9)
 * y el 0 de larga distancia antiguo ("073 221 1234").
 */
function nacional(raw: string): string {
  const d = digitos(raw);
  if (d.length === 11 && d.startsWith("56")) return d.slice(2);
  if (d.length === 10 && d.startsWith("0")) return d.slice(1);
  return d;
}

/**
 * Telefono en formato internacional (+56...) o, para 600/800, tal cual.
 * Null si no calza con ningun formato chileno conocido.
 */
export function telefonoInternacional(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = digitos(raw);
  if (ESPECIAL_RE.test(d)) return d;
  const n = nacional(raw);
  return NACIONAL_RE.test(n) ? `+56${n}` : null;
}

export function normalizarTelefono(raw: string): ResultadoContacto {
  if (!raw.trim()) return { ok: true, valor: null };
  const valor = telefonoInternacional(raw);
  if (valor) return { ok: true, valor };
  if (nacional(raw).length === 8) {
    return {
      ok: false,
      error: "Faltan dígitos: al celular agrégale el 9 y al fijo el código de área (ej: 73)",
    };
  }
  return { ok: false, error: "Ese número no parece chileno. Ej: +56 9 1234 5678" };
}

export function normalizarWhatsApp(raw: string): ResultadoContacto {
  if (!raw.trim()) return { ok: true, valor: null };
  const n = nacional(raw);
  if (/^9\d{8}$/.test(n)) return { ok: true, valor: `56${n}` };
  if (NACIONAL_RE.test(n)) {
    return { ok: false, error: "WhatsApp tiene que ser un celular (empieza con 9)" };
  }
  return { ok: false, error: "Ese número no parece un celular chileno. Ej: 9 1234 5678" };
}

/** Link `tel:`. Null solo si no hay ningun digito. */
export function telLink(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const internacional = telefonoInternacional(raw);
  if (internacional) return `tel:${internacional}`;
  // Dato viejo en un formato raro: se marca tal cual antes que esconderlo.
  const limpio = raw.replace(/[^\d+]/g, "");
  return limpio ? `tel:${limpio}` : null;
}

/** Link `wa.me`. Null si no hay numero o no es un celular valido. */
export function whatsAppLink(
  raw: string | null | undefined,
  mensaje: string = MENSAJE_WHATSAPP,
): string | null {
  if (!raw) return null;
  const r = normalizarWhatsApp(raw);
  if (!r.ok || !r.valor) return null;
  return `https://wa.me/${r.valor}?text=${encodeURIComponent(mensaje)}`;
}

// Nombre de usuario de Facebook: letras, numeros y punto, minimo 5.
const USUARIO_FACEBOOK_RE = /^[A-Za-z0-9.]{5,50}$/;
const HOST_FACEBOOK_RE = /(^|\.)(facebook\.com|fb\.com)$/i;

/**
 * Pagina de Facebook. Acepta el link en cualquiera de sus formas (www, m.,
 * fb.com, con ?ref=...) o solo el nombre de usuario. Guarda la URL canonica:
 * facebook no tiene un usuario unico como Instagram (hay /nombre y
 * /profile.php?id=...), asi que se guarda el link.
 */
export function normalizarFacebook(raw: string): ResultadoContacto {
  const s = raw.trim().replace(/^@/, "");
  if (!s) return { ok: true, valor: null };

  if (!s.includes("/") && !/facebook|fb\./i.test(s)) {
    if (!USUARIO_FACEBOOK_RE.test(s)) {
      return { ok: false, error: "Pega el link de tu página de Facebook" };
    }
    return { ok: true, valor: `https://www.facebook.com/${s}` };
  }

  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return { ok: false, error: "Ese link no parece válido" };
  }
  if (!HOST_FACEBOOK_RE.test(u.hostname)) {
    return { ok: false, error: "Eso no es un link de Facebook" };
  }

  const ruta = u.pathname.replace(/\/+$/, "");
  if (!ruta) {
    return { ok: false, error: "Ese link va a Facebook, pero no a tu página" };
  }
  // /profile.php necesita el ?id=; cualquier otra ruta se guarda sin query.
  const id = u.searchParams.get("id");
  const query = ruta === "/profile.php" && id ? `?id=${encodeURIComponent(id)}` : "";
  const valor = `https://www.facebook.com${ruta}${query}`;
  if (valor.length > 200) return { ok: false, error: "Link demasiado largo" };
  return { ok: true, valor };
}

/** Sitio web propio. Agrega https:// si falta. */
export function normalizarSitioWeb(raw: string): ResultadoContacto {
  const s = raw.trim();
  if (!s) return { ok: true, valor: null };
  if (s.length > 200) return { ok: false, error: "Máximo 200 caracteres" };

  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return { ok: false, error: "Ese link no parece válido" };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { ok: false, error: "Solo links http:// o https://" };
  }
  if (!u.hostname.includes(".")) {
    return { ok: false, error: "Ese link no parece válido" };
  }
  // Muchos negocios no tienen web y pegan su red social: va en su campo, asi
  // la ficha muestra el boton correcto.
  if (/(^|\.)instagram\.com$/i.test(u.hostname)) {
    return { ok: false, error: "Eso es Instagram: ponlo en el campo Instagram" };
  }
  if (HOST_FACEBOOK_RE.test(u.hostname)) {
    return { ok: false, error: "Eso es Facebook: ponlo en el campo Facebook" };
  }
  return { ok: true, valor: u.toString() };
}
