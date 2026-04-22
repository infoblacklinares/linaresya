"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { clearAdminCookie, isAdminAuthenticated } from "@/lib/admin-auth";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function aprobarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabaseAdmin.from("negocios").update({ activo: true }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function verificarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabaseAdmin
    .from("negocios")
    .update({ activo: true, verificado: true })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
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
