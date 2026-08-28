"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verificarAccionAdmin } from "@/lib/admin-link";
import { generarTokenDueno } from "@/lib/dueno-token";
import { sendOwnerAprobacionNotification } from "@/lib/email";

export type AprobarPorLinkState = { ok: boolean; error?: string };

/**
 * Aprueba un negocio desde el link firmado del correo, sin sesion de admin.
 * La autorizacion es la firma del token; por eso se vuelve a verificar aca y
 * no se confia en lo que haya visto la pagina.
 */
export async function aprobarPorLink(
  _prev: AprobarPorLinkState,
  formData: FormData,
): Promise<AprobarPorLinkState> {
  const token = String(formData.get("token") ?? "");
  const verificado = verificarAccionAdmin(token);

  if (!verificado.ok) {
    return {
      ok: false,
      error:
        verificado.motivo === "vencido"
          ? "El link ya venció. Entrá al panel para aprobarlo."
          : "Link inválido. Entrá al panel para aprobarlo.",
    };
  }

  const { negocioId } = verificado;

  const { data: antes } = await supabaseAdmin
    .from("negocios")
    .select("nombre, slug, email, activo, categorias:categoria_id(slug, nombre, emoji)")
    .eq("id", negocioId)
    .single();

  if (!antes) return { ok: false, error: "El negocio ya no existe." };

  const { error } = await supabaseAdmin
    .from("negocios")
    .update({ activo: true })
    .eq("id", negocioId);

  if (error) {
    return { ok: false, error: "No pudimos aprobarlo. Intentá desde el panel." };
  }

  revalidatePath("/admin");
  revalidatePath("/");

  // Aviso al dueño, con su link de edicion. Mismo criterio que el panel: solo
  // si venia inactivo y dejo correo. Nunca rompe la aprobacion.
  const yaEstaba = Boolean((antes as { activo?: unknown }).activo);
  const email = ((antes as { email?: unknown }).email as string | null) ?? null;
  const catRaw = (antes as { categorias?: unknown }).categorias;
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;

  if (!yaEstaba && email && cat) {
    try {
      const links = await generarTokenDueno(negocioId, {
        email,
        ip: "aprobacion-link",
      });
      await sendOwnerAprobacionNotification({
        nombre: String((antes as { nombre?: unknown }).nombre ?? ""),
        slug: String((antes as { slug?: unknown }).slug ?? ""),
        email,
        verificado: false,
        categoria: {
          slug: String((cat as { slug?: unknown }).slug ?? ""),
          nombre: String((cat as { nombre?: unknown }).nombre ?? ""),
          emoji: String((cat as { emoji?: unknown }).emoji ?? "🏪"),
        },
        editarUrl: links?.editarUrl,
        statsUrl: links?.statsUrl,
      });
    } catch {
      // El aviso nunca puede voltear una aprobacion que ya se guardo.
    }
  }

  return { ok: true };
}
