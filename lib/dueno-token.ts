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
