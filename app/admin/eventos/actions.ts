"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export type EventoState = { ok: boolean; error?: string };

export async function crearEvento(
  _prev: EventoState,
  formData: FormData,
): Promise<EventoState> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const titulo = String(formData.get("titulo") ?? "").trim().slice(0, 100);
  const descripcion = String(formData.get("descripcion") ?? "").trim().slice(0, 400) || null;
  const emoji = String(formData.get("emoji") ?? "🎉").trim().slice(0, 8) || "🎉";
  const lugar = String(formData.get("lugar") ?? "").trim().slice(0, 100);
  const direccion = String(formData.get("direccion") ?? "").trim().slice(0, 150) || null;
  const fechaInicio = String(formData.get("fecha_inicio") ?? "").trim();
  const fechaFin = String(formData.get("fecha_fin") ?? "").trim() || null;
  const imagenUrl = String(formData.get("imagen") ?? "").trim() || null;
  const link = String(formData.get("link") ?? "").trim().slice(0, 300) || null;
  const destacado = formData.get("destacado") === "on";

  if (titulo.length < 3) return { ok: false, error: "Título muy corto (mínimo 3)." };
  if (lugar.length < 3) return { ok: false, error: "Indica el lugar del evento." };
  const inicio = new Date(fechaInicio);
  if (isNaN(inicio.getTime())) return { ok: false, error: "Fecha de inicio inválida." };
  let fin: Date | null = null;
  if (fechaFin) {
    fin = new Date(fechaFin);
    if (isNaN(fin.getTime())) return { ok: false, error: "Fecha de término inválida." };
    if (fin <= inicio) return { ok: false, error: "El término debe ser después del inicio." };
  }
  if (link && !/^https?:\/\//i.test(link)) {
    return { ok: false, error: "El link debe empezar con http:// o https://." };
  }

  const { error } = await supabaseAdmin.from("eventos").insert({
    titulo,
    descripcion,
    emoji,
    lugar,
    direccion,
    fecha_inicio: inicio.toISOString(),
    fecha_fin: fin ? fin.toISOString() : null,
    imagen_url: imagenUrl,
    link,
    destacado,
  });

  if (error) {
    console.error("[eventos] insert error:", error.message);
    return { ok: false, error: "No se pudo crear el evento." };
  }

  revalidatePath("/");
  revalidatePath("/agenda");
  revalidatePath("/admin/eventos");
  return { ok: true };
}

export async function eliminarEvento(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await supabaseAdmin.from("eventos").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/agenda");
  revalidatePath("/admin/eventos");
}
