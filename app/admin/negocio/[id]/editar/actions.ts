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
  // foto_portada ahora viene del PhotoUpload (URL del bucket de Storage).
  // Validamos que pertenezca a nuestro Storage para evitar inyeccion de URLs.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const fotoPortadaValida =
    !fotoPortada ||
    (supabaseUrl &&
      fotoPortada.startsWith(`${supabaseUrl}/storage/v1/object/public/negocios/`));
  if (!fotoPortadaValida) {
    fieldErrors.foto_portada = "URL de foto invalida";
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

  // Sincronizar horarios: si el form trae los campos horario_*, borramos las
  // filas viejas e insertamos las nuevas. Si no trae nada (caso raro, p.ej.
  // request manual), no tocamos los horarios existentes.
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
    (dia) =>
      formData.has(`horario_${dia}_abre`) ||
      formData.has(`horario_${dia}_cierra`) ||
      formData.has(`horario_${dia}_cerrado`),
  );

  if (formTraeHorarios) {
    const filas: Array<{
      negocio_id: string;
      dia: string;
      abre: string | null;
      cierra: string | null;
      cerrado: boolean;
    }> = [];

    for (const dia of DIAS) {
      const cerrado = formData.get(`horario_${dia}_cerrado`) === "on";
      const abreRaw = String(formData.get(`horario_${dia}_abre`) ?? "").trim();
      const cierraRaw = String(formData.get(`horario_${dia}_cierra`) ?? "").trim();

      if (cerrado || !HORA_RE.test(abreRaw) || !HORA_RE.test(cierraRaw)) {
        filas.push({
          negocio_id: id,
          dia,
          abre: null,
          cierra: null,
          cerrado: true,
        });
      } else {
        filas.push({
          negocio_id: id,
          dia,
          abre: abreRaw,
          cierra: cierraRaw,
          cerrado: false,
        });
      }
    }

    // Borramos las filas viejas y reinsertamos. Operacion no atomica, pero
    // la tabla es chica y el riesgo de race aca es bajo (solo el admin edita).
    await supabaseAdmin.from("horarios").delete().eq("negocio_id", id);
    const { error: horariosError } = await supabaseAdmin
      .from("horarios")
      .insert(filas);
    if (horariosError) {
      return {
        ok: false,
        error: `Negocio guardado pero fallaron los horarios: ${horariosError.message}`,
      };
    }
  }

  // === SINCRONIZAR GALERIA ===
  // 1. Borrar fotos marcadas para eliminar (foto_eliminar_<id>=on)
  // 2. Insertar nuevas (foto_galeria_1..4 con URL del bucket)

  // Recoger ids a eliminar leyendo todas las claves del FormData que matchean
  const idsAEliminar: number[] = [];
  for (const [key, value] of formData.entries()) {
    const m = key.match(/^foto_eliminar_(\d+)$/);
    if (m && value === "on") {
      const fotoId = parseInt(m[1], 10);
      if (Number.isFinite(fotoId)) idsAEliminar.push(fotoId);
    }
  }
  if (idsAEliminar.length > 0) {
    const { error: deleteFotosError } = await supabaseAdmin
      .from("fotos")
      .delete()
      .in("id", idsAEliminar)
      .eq("negocio_id", id); // safety: nunca borrar fotos de otro negocio
    if (deleteFotosError) {
      console.error("Error eliminando fotos:", deleteFotosError);
    }
    // Nota: los archivos en Storage quedan huerfanos. Limpieza periodica
    // puede hacerse con un cron job que compare urls de fotos vs storage.
  }

  // Recoger nuevas fotos a insertar
  const supabaseUrlForGaleria = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const isUrlBucket = (url: string): boolean =>
    !!url &&
    !!supabaseUrlForGaleria &&
    url.startsWith(`${supabaseUrlForGaleria}/storage/v1/object/public/negocios/`);

  const nuevasUrls: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const url = String(formData.get(`foto_galeria_${i}`) ?? "").trim();
    if (isUrlBucket(url)) nuevasUrls.push(url);
  }

  if (nuevasUrls.length > 0) {
    // Calcular el siguiente "orden" basado en lo que ya hay
    const { data: maxOrdenRow } = await supabaseAdmin
      .from("fotos")
      .select("orden")
      .eq("negocio_id", id)
      .order("orden", { ascending: false })
      .limit(1)
      .maybeSingle();
    const inicio = ((maxOrdenRow?.orden as number | undefined) ?? -1) + 1;

    const filasFotos = nuevasUrls.map((url, idx) => ({
      negocio_id: id,
      url,
      orden: inicio + idx,
    }));
    const { error: insertFotosError } = await supabaseAdmin
      .from("fotos")
      .insert(filasFotos);
    if (insertFotosError) {
      console.error("Error insertando fotos galeria:", insertFotosError);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/admin/negocio/${id}/editar`);

  return { ok: true };
}
