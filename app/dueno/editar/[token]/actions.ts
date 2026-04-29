"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type DuenoUpdateState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

// Valida un token: debe existir, no estar expirado, y devuelve negocio_id.
async function validarToken(token: string): Promise<{
  ok: boolean;
  negocioId?: string;
  reason?: string;
}> {
  if (!token || token.length < 16) return { ok: false, reason: "Token invalido" };

  const { data } = await supabaseAdmin
    .from("dueno_tokens")
    .select("negocio_id, expira_en")
    .eq("token", token)
    .maybeSingle();

  if (!data) return { ok: false, reason: "Link invalido o ya usado" };

  const expira = new Date((data as { expira_en: string }).expira_en);
  if (Date.now() > expira.getTime()) {
    return { ok: false, reason: "Link expirado. Solicita uno nuevo." };
  }

  return { ok: true, negocioId: (data as { negocio_id: string }).negocio_id };
}

function normalizarWhatsApp(raw: string): string | null {
  if (!raw) return null;
  const d = raw.replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("56")) return d;
  if (d.startsWith("9") && d.length === 9) return "56" + d;
  return d;
}

export async function updateNegocioDueno(
  _prev: DuenoUpdateState,
  formData: FormData,
): Promise<DuenoUpdateState> {
  const token = String(formData.get("token") ?? "").trim();
  const valid = await validarToken(token);
  if (!valid.ok || !valid.negocioId) {
    return { ok: false, error: valid.reason ?? "Acceso invalido" };
  }
  const id = valid.negocioId;

  // Marcar primer uso (idempotente)
  await supabaseAdmin
    .from("dueno_tokens")
    .update({ usado_por_primera_vez: new Date().toISOString() })
    .eq("token", token)
    .is("usado_por_primera_vez", null);

  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const whatsappRaw = String(formData.get("whatsapp") ?? "").trim();
  const direccion = String(formData.get("direccion") ?? "").trim();
  const aDomicilio = formData.get("a_domicilio") === "on";
  const zonaCobertura = String(formData.get("zona_cobertura") ?? "").trim();
  const disponibilidad = String(formData.get("disponibilidad") ?? "").trim();
  const fotoPortada = String(formData.get("foto_portada") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (nombre.length < 3) fieldErrors.nombre = "Minimo 3 caracteres";
  if (nombre.length > 80) fieldErrors.nombre = "Maximo 80 caracteres";
  if (descripcion.length > 1000) fieldErrors.descripcion = "Maximo 1000 caracteres";
  if (zonaCobertura.length > 200) fieldErrors.zona_cobertura = "Maximo 200 caracteres";
  if (disponibilidad.length > 120) fieldErrors.disponibilidad = "Maximo 120 caracteres";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const isUrlBucket = (url: string): boolean =>
    !url ||
    (!!supabaseUrl &&
      url.startsWith(`${supabaseUrl}/storage/v1/object/public/negocios/`));

  if (fotoPortada && !isUrlBucket(fotoPortada)) {
    fieldErrors.foto_portada = "URL de foto invalida";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: "Revisa los campos marcados" };
  }

  const whatsapp = normalizarWhatsApp(whatsappRaw);

  // Actualizar SOLO los campos que el dueno puede editar.
  // Campos prohibidos: activo, verificado, plan, premium_hasta, categoria_id, slug
  const update: Record<string, unknown> = {
    nombre,
    descripcion: descripcion || null,
    telefono: telefono || null,
    whatsapp,
    direccion: direccion || null,
    a_domicilio: aDomicilio,
    zona_cobertura: zonaCobertura || null,
    disponibilidad: disponibilidad || null,
  };
  if (fotoPortada && isUrlBucket(fotoPortada)) {
    update.foto_portada = fotoPortada;
  }

  const { error } = await supabaseAdmin
    .from("negocios")
    .update(update)
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      error: `No pudimos guardar: ${error.message}`,
    };
  }

  // Sincronizar horarios igual que el flujo admin
  const DIAS = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ] as const;
  const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  const formTraeHorarios = DIAS.some(
    (d) =>
      formData.has(`horario_${d}_abre`) ||
      formData.has(`horario_${d}_cerrado`),
  );

  if (formTraeHorarios) {
    const filas = DIAS.map((dia) => {
      const cerrado = formData.get(`horario_${dia}_cerrado`) === "on";
      const abre = String(formData.get(`horario_${dia}_abre`) ?? "").trim();
      const cierra = String(formData.get(`horario_${dia}_cierra`) ?? "").trim();
      if (cerrado || !HORA_RE.test(abre) || !HORA_RE.test(cierra)) {
        return { negocio_id: id, dia, abre: null, cierra: null, cerrado: true };
      }
      return { negocio_id: id, dia, abre, cierra, cerrado: false };
    });
    await supabaseAdmin.from("horarios").delete().eq("negocio_id", id);
    await supabaseAdmin.from("horarios").insert(filas);
  }

  // Sincronizar galeria: borrar marcadas + agregar nuevas
  const idsAEliminar: number[] = [];
  for (const [key, value] of formData.entries()) {
    const m = key.match(/^foto_eliminar_(\d+)$/);
    if (m && value === "on") {
      const fid = parseInt(m[1], 10);
      if (Number.isFinite(fid)) idsAEliminar.push(fid);
    }
  }
  if (idsAEliminar.length > 0) {
    await supabaseAdmin
      .from("fotos")
      .delete()
      .in("id", idsAEliminar)
      .eq("negocio_id", id);
  }

  const nuevasUrls: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const url = String(formData.get(`foto_galeria_${i}`) ?? "").trim();
    if (url && isUrlBucket(url)) nuevasUrls.push(url);
  }
  if (nuevasUrls.length > 0) {
    const { data: maxRow } = await supabaseAdmin
      .from("fotos")
      .select("orden")
      .eq("negocio_id", id)
      .order("orden", { ascending: false })
      .limit(1)
      .maybeSingle();
    const inicio = ((maxRow?.orden as number | undefined) ?? -1) + 1;
    const filasFotos = nuevasUrls.map((url, idx) => ({
      negocio_id: id,
      url,
      orden: inicio + idx,
    }));
    await supabaseAdmin.from("fotos").insert(filasFotos);
  }

  // Revalidar la ficha publica
  const { data: negocioFresh } = await supabaseAdmin
    .from("negocios")
    .select("slug, categorias:categoria_id(slug)")
    .eq("id", id)
    .single();
  if (negocioFresh) {
    const slug = (negocioFresh as { slug?: string }).slug;
    const catRaw = (negocioFresh as { categorias?: unknown }).categorias;
    const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
    const catSlug =
      cat && typeof cat === "object"
        ? String((cat as { slug?: unknown }).slug ?? "")
        : "";
    if (slug && catSlug) {
      revalidatePath(`/${catSlug}/${slug}`);
    }
  }
  revalidatePath("/");

  return { ok: true };
}
