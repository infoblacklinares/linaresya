"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export type HistoriaState = { ok: boolean; error?: string };

export async function crearHistoria(
  _prev: HistoriaState,
  formData: FormData,
): Promise<HistoriaState> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const negocioId = String(formData.get("negocio_id") ?? "").trim();
  const imagenUrl = String(formData.get("imagen") ?? "").trim();
  const texto = String(formData.get("texto") ?? "").trim().slice(0, 120);
  const horas = Number(formData.get("horas") ?? 24);

  if (!negocioId) return { ok: false, error: "Elige un negocio." };
  if (!imagenUrl) return { ok: false, error: "Sube una imagen para la historia." };
  const horasValidas = [24, 48, 72].includes(horas) ? horas : 24;

  // El admin puede publicar para cualquier negocio activo (los dueños,
  // cuando tengan acceso propio, quedarán limitados a premium).
  const { data: negocio } = await supabaseAdmin
    .from("negocios")
    .select("id, activo")
    .eq("id", negocioId)
    .single();
  if (!negocio || !negocio.activo) {
    return { ok: false, error: "El negocio no existe o no está activo." };
  }

  const expira = new Date(Date.now() + horasValidas * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin.from("historias").insert({
    negocio_id: negocioId,
    imagen_url: imagenUrl,
    texto: texto || null,
    expira_en: expira,
  });

  if (error) {
    console.error("[historias] insert error:", error.message);
    return { ok: false, error: "No se pudo crear la historia." };
  }

  revalidatePath("/");
  revalidatePath("/admin/historias");
  return { ok: true };
}

export async function eliminarHistoria(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await supabaseAdmin.from("historias").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/historias");
}
