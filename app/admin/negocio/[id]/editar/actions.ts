"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export type UpdateState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function normalizarWhatsApp(raw: string): string | null {
  if (!raw) return null;
  const soloDigitos = raw.replace(/\D/g, "");
  if (!soloDigitos) return null;
  if (soloDigitos.startsWith("56")) return soloDigitos;
  if (soloDigitos.startsWith("9") && soloDigitos.length === 9) return "56" + soloDigitos;
  return soloDigitos;
}

export async function updateNegocio(
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Falta el id" };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoriaIdRaw = String(formData.get("categoria_id") ?? "").trim();
  const tipoRaw = String(formData.get("tipo") ?? "negocio").trim();
  const planRaw = String(formData.get("plan") ?? "basico").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const whatsappRaw = String(formData.get("whatsapp") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const sitioWeb = String(formData.get("sitio_web") ?? "").trim();
  const direccion = String(formData.get("direccion") ?? "").trim();
  const aDomicilio = formData.get("a_domicilio") === "on";
  const zonaCobertura = String(formData.get("zona_cobertura") ?? "").trim();
  const disponibilidad = String(formData.get("disponibilidad") ?? "").trim();
  const fotoPortada = String(formData.get("foto_portada") ?? "").trim();
  const activo = formData.get("activo") === "on";
  const verificado = formData.get("verificado") === "on";
  const premiumHastaRaw = String(formData.get("premium_hasta") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (nombre.length < 3) fieldErrors.nombre = "Minimo 3 caracteres";
  if (nombre.length > 80) fieldErrors.nombre = "Maximo 80 caracteres";
  if (descripcion.length > 1000) fieldErrors.descripcion = "Maximo 1000 caracteres";
  const categoriaId = categoriaIdRaw ? Number(categoriaIdRaw) : null;
  if (categoriaIdRaw && (!Number.isFinite(categoriaId) || (categoriaId ?? 0) <= 0)) {
    fieldErrors.categoria_id = "Categoria invalida";
  }

  const tipo: "negocio" | "independiente" =
    tipoRaw === "independiente" ? "independiente" : "negocio";
  const plan: "basico" | "premium" = planRaw === "premium" ? "premium" : "basico";

  let premiumHasta: string | null = null;
  if (premiumHastaRaw) {
    const d = new Date(premiumHastaRaw);
    if (isNaN(d.getTime())) {
      fieldErrors.premium_hasta = "Fecha invalida";
    } else {
      premiumHasta = d.toISOString();
    }
  }

  if (sitioWeb && !/^https?:\/\//i.test(sitioWeb)) {
    fieldErrors.sitio_web = "Debe empezar con http:// o https://";
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Email invalido";
  }
  if (fotoPortada && !/^https?:\/\//i.test(fotoPortada)) {
    fieldErrors.foto_portada = "Debe ser una URL http:// o https://";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: "Revisa los campos marcados" };
  }

  const whatsapp = normalizarWhatsApp(whatsappRaw);

  const update: Record<string, unknown> = {
    nombre,
    tipo,
    plan,
    descripcion: descripcion || null,
    telefono: telefono || null,
    whatsapp,
    email: email || null,
    sitio_web: sitioWeb || null,
    direccion: direccion || null,
    a_domicilio: aDomicilio,
    zona_cobertura: zonaCobertura || null,
    disponibilidad: disponibilidad || null,
    foto_portada: fotoPortada || null,
    activo,
    verificado,
    premium_hasta: premiumHasta,
  };
  if (categoriaId) update.categoria_id = categoriaId;

  const { error } = await supabaseAdmin
    .from("negocios")
    .update(update)
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      error: `Error al guardar: ${error.message}`,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/admin/negocio/${id}/editar`);

  return { ok: true };
}
