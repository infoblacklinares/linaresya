"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export type PublicarState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

// Normaliza texto a slug: minúsculas, sin acentos, sin símbolos, guiones.
function toSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

// Normaliza un número de WhatsApp a formato internacional sin +.
// Si viene con +56 o 56 se respeta, si viene con 9 XXXX XXXX se asume Chile (+56).
function normalizarWhatsApp(raw: string): string {
  const soloDigitos = raw.replace(/\D/g, "");
  if (!soloDigitos) return "";
  if (soloDigitos.startsWith("56")) return soloDigitos;
  if (soloDigitos.startsWith("9") && soloDigitos.length === 9) return "56" + soloDigitos;
  return soloDigitos;
}

export async function publicarNegocio(
  _prevState: PublicarState,
  formData: FormData,
): Promise<PublicarState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoriaIdRaw = String(formData.get("categoria_id") ?? "").trim();
  const tipoRaw = String(formData.get("tipo") ?? "negocio").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const whatsappRaw = String(formData.get("whatsapp") ?? "").trim();
  const direccion = String(formData.get("direccion") ?? "").trim();
  const aDomicilio = formData.get("a_domicilio") === "on";
  const zonaCobertura = String(formData.get("zona_cobertura") ?? "").trim();
  const disponibilidad = String(formData.get("disponibilidad") ?? "").trim();

  // Validación
  const fieldErrors: Record<string, string> = {};
  if (nombre.length < 3) fieldErrors.nombre = "Minimo 3 caracteres";
  if (nombre.length > 80) fieldErrors.nombre = "Maximo 80 caracteres";
  if (!categoriaIdRaw) fieldErrors.categoria_id = "Elige una categoria";
  const categoriaId = Number(categoriaIdRaw);
  if (!Number.isFinite(categoriaId) || categoriaId <= 0) {
    fieldErrors.categoria_id = "Categoria invalida";
  }
  const tipo: "negocio" | "independiente" =
    tipoRaw === "independiente" ? "independiente" : "negocio";
  if (descripcion.length > 500) fieldErrors.descripcion = "Maximo 500 caracteres";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: "Revisa los campos marcados" };
  }

  const whatsapp = whatsappRaw ? normalizarWhatsApp(whatsappRaw) : null;
  const slugBase = toSlug(nombre);

  // Chequea si el slug ya existe y agrega sufijo si es necesario
  let slug = slugBase || `negocio-${Date.now()}`;
  const { data: existing } = await supabaseAdmin
    .from("negocios")
    .select("slug")
    .like("slug", `${slugBase}%`);

  if (existing && existing.length > 0) {
    const usados = new Set(existing.map((x) => x.slug));
    if (usados.has(slug)) {
      let i = 2;
      while (usados.has(`${slugBase}-${i}`)) i++;
      slug = `${slugBase}-${i}`;
    }
  }

  const { error } = await supabaseAdmin.from("negocios").insert({
    nombre,
    slug,
    descripcion: descripcion || null,
    categoria_id: categoriaId,
    tipo,
    plan: "basico",
    activo: false,       // queda pendiente de aprobacion
    verificado: false,
    telefono: telefono || null,
    whatsapp,
    email: null,
    sitio_web: null,
    direccion: direccion || null,
    ciudad: "Linares",
    a_domicilio: aDomicilio,
    zona_cobertura: zonaCobertura || null,
    disponibilidad: disponibilidad || null,
  });

  if (error) {
    return {
      ok: false,
      error: "No pudimos guardar tu solicitud. Intenta de nuevo en unos minutos.",
    };
  }

  return { ok: true };
}
