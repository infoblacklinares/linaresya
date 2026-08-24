import crypto from "crypto";

const SALT = "linaresya-accion-admin-v1";

/**
 * Links firmados para que el admin apruebe desde el correo, sin abrir el
 * panel ni iniciar sesion.
 *
 * Se firman con ADMIN_PASSWORD, igual que la cookie de sesion: cambiar la
 * password invalida todos los links viejos. Cada link sirve para UN negocio,
 * UNA accion y vence solo.
 *
 * El link NO ejecuta la accion al abrirlo: los escaneadores de correo siguen
 * los enlaces automaticamente, asi que aprobar en un GET significaria aprobar
 * negocios sin que nadie los mire. La pagina muestra el negocio y aprueba
 * recien al apretar el boton.
 */
export type AccionAdmin = "aprobar";

export const HORAS_LINK_ADMIN = 24 * 7;

function firmar(payload: string): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return crypto
    .createHmac("sha256", password + SALT)
    .update(payload)
    .digest("hex");
}

export function firmarAccionAdmin(
  negocioId: string,
  accion: AccionAdmin,
  horas: number = HORAS_LINK_ADMIN,
): string | null {
  if (!process.env.ADMIN_PASSWORD) return null;
  const exp = Math.floor(Date.now() / 1000) + horas * 60 * 60;
  const payload = `${negocioId}.${accion}.${exp}`;
  return `${payload}.${firmar(payload)}`;
}

export type AccionVerificada =
  | { ok: true; negocioId: string; accion: AccionAdmin }
  | { ok: false; motivo: "invalido" | "vencido" };

export function verificarAccionAdmin(token: string): AccionVerificada {
  if (!process.env.ADMIN_PASSWORD) return { ok: false, motivo: "invalido" };

  const partes = token.split(".");
  if (partes.length !== 4) return { ok: false, motivo: "invalido" };

  const [negocioId, accion, expRaw, sig] = partes;
  if (accion !== "aprobar") return { ok: false, motivo: "invalido" };

  const esperado = firmar(`${negocioId}.${accion}.${expRaw}`);
  const got = Buffer.from(sig);
  const want = Buffer.from(esperado);
  if (got.length !== want.length) return { ok: false, motivo: "invalido" };
  if (!crypto.timingSafeEqual(got, want)) return { ok: false, motivo: "invalido" };

  const exp = Number(expRaw);
  if (!Number.isFinite(exp)) return { ok: false, motivo: "invalido" };
  if (exp < Math.floor(Date.now() / 1000)) return { ok: false, motivo: "vencido" };

  return { ok: true, negocioId, accion };
}
