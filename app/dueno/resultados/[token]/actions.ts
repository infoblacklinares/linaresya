"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { negocioDelToken } from "@/lib/dueno-token";
import {
  contarReportado,
  esPeriodoValido,
  limpiarNota,
} from "@/lib/resultados";

/**
 * El negocio reporta sus resultados del mes, sin pasar por el admin (LY-028).
 *
 * Autorizacion: **el token manda**. El `negocio_id` sale de la base a partir
 * del token, nunca del formulario: si se confiara en un campo oculto, cualquier
 * duenno con un link valido podria escribir sobre la ficha de otro.
 */
export async function guardarResultadoDueno(
  _estado: { ok: boolean; mensaje: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; mensaje: string }> {
  const token = String(formData.get("token") ?? "");
  const negocioId = await negocioDelToken(token);
  if (!negocioId) {
    return { ok: false, mensaje: "El link ya no sirve. Pide uno nuevo." };
  }

  const periodo = String(formData.get("periodo") ?? "");
  if (!esPeriodoValido(periodo)) {
    return { ok: false, mensaje: "No se pudo identificar el mes." };
  }

  const consultas = contarReportado(formData.get("consultas"));
  const clientes = contarReportado(formData.get("clientes"));
  const nota = limpiarNota(formData.get("nota"));

  if (consultas === null && clientes === null && nota === null) {
    return { ok: false, mensaje: "Escribe al menos un dato antes de enviar." };
  }

  const { error } = await supabaseAdmin
    .from("resultados_negocio")
    .upsert(
      { negocio_id: negocioId, periodo, consultas, clientes, nota },
      { onConflict: "negocio_id,periodo" },
    );

  if (error) {
    console.error("[guardarResultadoDueno] error:", error.message);
    return { ok: false, mensaje: "No se pudo guardar. Intenta de nuevo." };
  }

  revalidatePath("/admin/resultados");
  revalidatePath(`/dueno/resultados/${token}`);
  return { ok: true, mensaje: "Listo, quedó guardado. Gracias." };
}
