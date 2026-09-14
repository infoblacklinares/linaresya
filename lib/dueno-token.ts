import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linaresya.cl";

/** Link que se genera al aprobar: el dueño ya recibio el aviso por correo. */
export const HORAS_APROBACION = 72;

/**
 * Link que se entrega al publicar, en la misma pantalla de exito. Dura mas
 * porque puede ser lo unico que tenga el dueño: si publico desde el popup no
 * dejo correo, asi que no hay forma de reenviarselo sin pasar por el admin —
 * que es justo el cuello de botella que esto viene a sacar.
 */
export const HORAS_ALTA = 24 * 30;

/**
 * Link para pedirle al negocio los resultados del mes (LY-028). Dura 45 dias:
 * el correo sale el dia 1 y tiene que seguir sirviendo si lo abre tres semanas
 * despues, o si Willson le reenvia el mismo link por WhatsApp.
 */
export const HORAS_RESULTADOS = 24 * 45;

/**
 * Crea un magic link para que el dueño edite su ficha sin pasar por el admin.
 *
 * Nunca lanza: si algo falla devuelve null. Ningun flujo que la use (aprobar
 * un negocio, publicar uno nuevo) puede romperse porque el link no salga.
 */
export async function generarTokenDueno(
  negocioId: string,
  opciones: { email?: string | null; ip?: string; horas?: number } = {},
): Promise<{ editarUrl: string; statsUrl: string } | null> {
  const { email, ip = "alta-web", horas = HORAS_APROBACION } = opciones;
  try {
    const token = randomBytes(24).toString("hex");
    const expiraEn = new Date(Date.now() + horas * 60 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin.from("dueno_tokens").insert({
      negocio_id: negocioId,
      token,
      // La columna es NOT NULL. Cuando el alta no dejo correo guardamos una
      // marca, para poder distinguir despues de donde salio el token.
      email_solicitado: email || "sin-email",
      expira_en: expiraEn,
      ip,
    });
    if (error) {
      console.error("[generarTokenDueno] error:", error);
      return null;
    }

    return {
      editarUrl: `${SITE_URL}/dueno/editar/${token}`,
      statsUrl: `${SITE_URL}/dueno/estadisticas/${token}`,
    };
  } catch (err) {
    console.error("[generarTokenDueno] excepcion:", err);
    return null;
  }
}

/**
 * El negocio al que da acceso un token, o null si no sirve.
 *
 * La unica fuente de autorizacion de las pantallas del duenno: **nunca** se
 * confia en un `negocio_id` que venga del formulario, porque entonces
 * cualquiera con un token valido podria escribir sobre la ficha de otro.
 */
export async function negocioDelToken(token: string): Promise<string | null> {
  if (!token) return null;
  const { data } = await supabaseAdmin
    .from("dueno_tokens")
    .select("negocio_id, expira_en")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;

  const fila = data as { negocio_id: string; expira_en: string };
  if (Date.now() > new Date(fila.expira_en).getTime()) return null;
  return fila.negocio_id;
}

/** Link para que el negocio reporte sus resultados del mes. */
export async function generarLinkResultados(negocioId: string): Promise<string | null> {
  try {
    const token = randomBytes(24).toString("hex");
    const expiraEn = new Date(Date.now() + HORAS_RESULTADOS * 3600_000).toISOString();
    const { error } = await supabaseAdmin.from("dueno_tokens").insert({
      negocio_id: negocioId,
      token,
      email_solicitado: "pedido-resultados",
      expira_en: expiraEn,
      ip: "cron-resultados",
    });
    if (error) {
      console.error("[generarLinkResultados] error:", error.message);
      return null;
    }
    return `${SITE_URL}/dueno/resultados/${token}`;
  } catch (err) {
    console.error("[generarLinkResultados] error:", err);
    return null;
  }
}
