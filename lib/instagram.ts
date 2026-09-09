/**
 * Instagram del negocio.
 *
 * Guardamos el usuario (`panaderia.laespiga`), no la URL entera. La gente
 * escribe esto de cinco maneras distintas —con arroba, sin arroba, pegando el
 * link del navegador, con el `?igshid=...` que Instagram agrega al compartir—
 * y todas tienen que terminar en el mismo lugar. Guardar el usuario deja una
 * sola forma canonica: el link se arma al mostrarlo y siempre apunta al
 * perfil.
 */

// 1 a 30 caracteres: letras, numeros, punto y guion bajo. Es la regla de
// Instagram. El punto no puede ir al principio ni al final, ni repetido.
const USUARIO_RE = /^(?!\.)(?!.*\.\.)[A-Za-z0-9._]{1,30}(?<!\.)$/;

// Rutas de instagram.com que no son perfiles. Sin esto, pegar el link de una
// publicacion guardaria "p" como usuario y el boton llevaria a una pagina de
// error.
const NO_SON_PERFILES = new Set([
  "p", "reel", "reels", "tv", "stories", "explore", "direct", "accounts",
  "about", "developer", "legal", "privacy", "terms", "help", "s",
]);

export type ResultadoInstagram =
  | { ok: true; usuario: string | null }
  | { ok: false; error: string };

/**
 * Toma lo que el usuario escribio y devuelve el nombre de usuario limpio.
 * Vacio devuelve `{ ok: true, usuario: null }`: el campo es opcional.
 */
export function normalizarInstagram(raw: string): ResultadoInstagram {
  // La barra final sobra siempre: viene de copiar del navegador y no cambia
  // a donde apunta. Se saca antes de decidir si esto es un link o un usuario,
  // para que "donvittorio/" no cuente como ruta.
  let s = raw.trim().replace(/\/+$/, "");
  if (!s) return { ok: true, usuario: null };

  // Pegaron un link: nos quedamos con el primer segmento de la ruta.
  if (/^(https?:\/\/)?([a-z0-9-]+\.)*instagram\.com(\/|$)/i.test(s)) {
    const sinProtocolo = s.replace(/^https?:\/\//i, "");
    const corte = sinProtocolo.indexOf("/");
    // Sin ruta ("instagram.com") no hay perfil que abrir.
    const ruta = corte === -1 ? "" : sinProtocolo.slice(corte + 1);
    const primero = ruta.split(/[/?#]/)[0] ?? "";
    if (!primero) {
      return { ok: false, error: "Ese link va a Instagram, pero no a un perfil" };
    }
    if (NO_SON_PERFILES.has(primero.toLowerCase())) {
      return {
        ok: false,
        error: "Ese es el link de una publicación. Necesitamos el de tu perfil",
      };
    }
    s = primero;
  } else if (s.includes("/")) {
    // Un link que no es de Instagram: mejor decirlo que guardar basura.
    //
    // La barra es la unica senal que usamos para decidir que algo es un link,
    // y no el punto: hay usuarios de Instagram con punto adentro
    // ("panaderia.laespiga"), y rechazarlos por parecerse a un dominio seria
    // rechazar a la mitad de los negocios que escriben su usuario sin arroba.
    return { ok: false, error: "Eso no parece un Instagram" };
  }

  s = s.replace(/^@/, "");

  if (!USUARIO_RE.test(s)) {
    return {
      ok: false,
      error: "Solo letras, números, punto y guion bajo (máximo 30)",
    };
  }

  // Instagram no distingue mayusculas: guardamos en minuscula para que el
  // mismo perfil no quede escrito de dos formas distintas.
  return { ok: true, usuario: s.toLowerCase() };
}

/** El link al perfil. Recibe el usuario ya normalizado. */
export function urlInstagram(usuario: string): string {
  return `https://instagram.com/${usuario}`;
}
