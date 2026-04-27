"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { clearAdminCookie, isAdminAuthenticated } from "@/lib/admin-auth";
import { sendOwnerAprobacionNotification } from "@/lib/email";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

// Trae los datos minimos para decidir si mandamos email al duenio.
// Devuelve null si el negocio no existe.
type NegocioParaAprobar = {
  nombre: string;
  slug: string;
  email: string | null;
  activo: boolean;
  categoria: {
    nombre: string;
    slug: string;
    emoji: string;
  } | null;
};

async function fetchNegocioParaAprobar(id: string): Promise<NegocioParaAprobar | null> {
  const { data } = await supabaseAdmin
    .from("negocios")
    .select(
      "nombre, slug, email, activo, categorias:categoria_id(nombre, slug, emoji)",
    )
    .eq("id", id)
    .single();
  if (!data) return null;
  // Supabase tipa la relacion como array por defecto en el cliente.
  // En la practica con foreign key 1:1 viene como objeto, pero normalizamos.
  const catRaw = (data as { categorias: unknown }).categorias;
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
  const categoria =
    cat && typeof cat === "object"
      ? {
          nombre: String((cat as { nombre?: unknown }).nombre ?? ""),
          slug: String((cat as { slug?: unknown }).slug ?? ""),
          emoji: String((cat as { emoji?: unknown }).emoji ?? ""),
        }
      : null;
  return {
    nombre: String((data as { nombre?: unknown }).nombre ?? ""),
    slug: String((data as { slug?: unknown }).slug ?? ""),
    email: ((data as { email?: unknown }).email as string | null) ?? null,
    activo: Boolean((data as { activo?: unknown }).activo),
    categoria,
  };
}

// Decide si corresponde notificar al duenio: solo cuando el negocio pasa
// de inactivo a activo (no en re-aprobaciones) y tiene email cargado.
async function notificarSiCorresponde(
  antes: NegocioParaAprobar,
  verificado: boolean,
): Promise<void> {
  if (antes.activo) return; // Ya estaba publicado, no re-notificamos.
  if (!antes.email) return;
  if (!antes.categoria) return;
  try {
    await sendOwnerAprobacionNotification({
      nombre: antes.nombre,
      slug: antes.slug,
      email: antes.email,
      verificado,
      categoria: antes.categoria,
    });
  } catch {
    // sendOwner ya atrapa errores, pero por las dudas.
  }
}

export async function aprobarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const antes = await fetchNegocioParaAprobar(id);
  await supabaseAdmin.from("negocios").update({ activo: true }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
  if (antes) await notificarSiCorresponde(antes, false);
}

export async function verificarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const antes = await fetchNegocioParaAprobar(id);
  await supabaseAdmin
    .from("negocios")
    .update({ activo: true, verificado: true })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
  if (antes) await notificarSiCorresponde(antes, true);
}

export async function desactivarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabaseAdmin.from("negocios").update({ activo: false }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function eliminarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabaseAdmin.from("negocios").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function logoutAction(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin/login");
}
