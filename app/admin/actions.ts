"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generarTokenDueno, generarLinkResultados } from "@/lib/dueno-token";
import { clearAdminCookie, isAdminAuthenticated } from "@/lib/admin-auth";
import {
  sendOwnerAprobacionNotification,
  sendOwnerPremiumNotification,
  sendOwnerResenaAprobadaNotification,
} from "@/lib/email";
import { deleteFotosFromStorage } from "@/lib/storage";
import { vencimientoEnDias } from "@/lib/planes";
import { whatsAppLink } from "@/lib/contacto";
import { logAuditServer } from "@/lib/audit-server";

import {
  contarReportado,
  esPeriodoValido,
  limpiarNota,
} from "@/lib/resultados";

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
  verificado: boolean;
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
      "nombre, slug, email, activo, verificado, categorias:categoria_id(nombre, slug, emoji)",
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
    verificado: Boolean((data as { verificado?: unknown }).verificado),
    categoria,
  };
}

// Decide si corresponde notificar al duenio: solo cuando el negocio pasa
// de inactivo a activo (no en re-aprobaciones) y tiene email cargado.
async function notificarSiCorresponde(
  antes: NegocioParaAprobar,
  negocioId: string,
  verificado: boolean,
): Promise<void> {
  if (antes.activo) return; // Ya estaba publicado, no re-notificamos.
  if (!antes.email) return;
  if (!antes.categoria) return;
  try {
    // Generamos un magic link para que el dueño pueda entrar a editar y ver stats
    // directamente desde el email, sin tener que pedirlo aparte.
    const links = await generarTokenDueno(negocioId, {
      email: antes.email,
      ip: "admin-auto",
    });
    await sendOwnerAprobacionNotification({
      nombre: antes.nombre,
      slug: antes.slug,
      email: antes.email,
      verificado,
      categoria: antes.categoria,
      editarUrl: links?.editarUrl,
      statsUrl:  links?.statsUrl,
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
  const { error: updateError } = await supabaseAdmin.from("negocios").update({ activo: true }).eq("id", id);
  if (updateError) throw new Error(`No se pudo aprobar la ficha: ${updateError.message}`);
  await logAuditServer({ action: "UPDATE", entityType: "negocios", entityId: id, before: { activo: antes?.activo ?? null }, after: { activo: true }, reason: "Aprobación de ficha" });
  revalidatePath("/admin");
  revalidatePath("/");
  if (antes) await notificarSiCorresponde(antes, id, false);
}

export async function verificarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const fuente = String(formData.get("fuente") ?? "").trim();
  const urlFuente = String(formData.get("url_fuente") ?? "").trim() || null;
  const evidencia = String(formData.get("evidencia") ?? "").trim();
  const observacion = String(formData.get("observacion") ?? "").trim() || null;

  if (!id || !fuente || !evidencia) {
    throw new Error("Para verificar una ficha debes registrar la fuente y la evidencia.");
  }

  const fuentesPermitidas = new Set([
    "google_maps",
    "sitio_web",
    "instagram",
    "facebook",
    "directorio_empresarial",
    "otra_fuente_publica",
  ]);

  if (!fuentesPermitidas.has(fuente)) {
    throw new Error("Fuente de verificación no válida.");
  }

  const antes = await fetchNegocioParaAprobar(id);

  const { error: historialError } = await supabaseAdmin
    .from("verificaciones_negocio")
    .insert({
      negocio_id: id,
      estado: "verificado",
      fuente,
      url_fuente: urlFuente,
      evidencia,
      coincide_nombre: formData.get("coincide_nombre") === "on",
      coincide_direccion: formData.get("coincide_direccion") === "on",
      coincide_telefono: formData.get("coincide_telefono") === "on",
      observacion,
    });

  if (historialError) {
    throw new Error(`No se pudo guardar el historial de verificación: ${historialError.message}`);
  }

  const { error } = await supabaseAdmin
    .from("negocios")
    .update({ activo: true, verificado: true })
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo marcar la ficha como verificada: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/calidad");
  revalidatePath("/admin/verificacion");
  revalidatePath("/");
  if (antes) await notificarSiCorresponde(antes, id, true);
  await logAuditServer({ action: "UPDATE", entityType: "negocios", entityId: id, before: { activo: antes?.activo ?? null, verificado: antes?.verificado ?? null }, after: { activo: true, verificado: true }, reason: "Verificación de ficha" });
}

export async function desactivarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { data: antes } = await supabaseAdmin.from("negocios").select("activo").eq("id", id).maybeSingle();
  const { error } = await supabaseAdmin.from("negocios").update({ activo: false }).eq("id", id);
  if (error) throw new Error(`No se pudo desactivar la ficha: ${error.message}`);
  await logAuditServer({ action: "UPDATE", entityType: "negocios", entityId: id, before: { activo: (antes as { activo?: unknown } | null)?.activo ?? null }, after: { activo: false }, reason: "Desactivación de ficha" });
  revalidatePath("/admin");
  revalidatePath("/");
}

// ===== PLAN =====

/**
 * Cambia el plan de un negocio y revalida donde se ve.
 *
 * La ficha se re-renderiza en cada visita, pero el listado de la categoria, la
 * portada y el mapa quedan cacheados: sin revalidarlos, el sello Premium y el
 * boton de WhatsApp no aparecian "enseguida" como uno espera.
 */
async function cambiarPlanNegocio(
  id: string,
  plan: "basico" | "premium",
  premiumHasta: string | null,
): Promise<void> {
  const { data: antesRaw } = await supabaseAdmin
    .from("negocios")
    .select(
      "nombre, slug, email, whatsapp, plan, premium_desde, premium_hasta, categorias:categoria_id(nombre, slug, emoji)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!antesRaw) {
    throw new Error("No se encontró el negocio para cambiar su plan.");
  }

  const eraPremiumPrevio =
    String((antesRaw as Record<string, unknown>).plan ?? "") === "premium";

  const cambios: Record<string, unknown> = { plan, premium_hasta: premiumHasta };
  // Fecha de inicio del Premium: se escribe solo cuando el plan sube, para no
  // reiniciarla en cada guardado, y se limpia al volver a Basico.
  if (plan === "premium" && !eraPremiumPrevio) {
    cambios.premium_desde = new Date().toISOString();
  } else if (plan === "basico") {
    cambios.premium_desde = null;
  }

  let { error } = await supabaseAdmin
    .from("negocios")
    .update(cambios)
    .eq("id", id);

  // La columna se agrega a mano con supabase/premium_desde.sql. Si todavia no
  // se corrio, Supabase rechaza la fila entera: se reintenta sin ella, porque
  // cambiar el plan no puede quedar bloqueado por una columna opcional.
  if (error && /premium_desde/i.test(error.message)) {
    console.warn(
      "[cambiarPlanNegocio] Falta la columna premium_desde: corre supabase/premium_desde.sql. El plan se cambia igual.",
    );
    delete cambios.premium_desde;
    ({ error } = await supabaseAdmin.from("negocios").update(cambios).eq("id", id));
  }
  if (error) {
    console.error("[cambiarPlanNegocio] error:", error.message);
    throw new Error(`No se pudo cambiar el plan del negocio: ${error.message}`);
  }

  await logAuditServer({
    action: "UPDATE",
    entityType: "negocios",
    entityId: id,
    before: { plan: antesRaw?.plan ?? null, premium_hasta: antesRaw?.premium_hasta ?? null, premium_desde: antesRaw?.premium_desde ?? null },
    after: { plan, premium_hasta: premiumHasta, premium_desde: cambios.premium_desde ?? antesRaw?.premium_desde ?? null },
    reason: plan === "premium" ? "Activación de Premium" : "Retiro de Premium",
  });

  const antes = (antesRaw ?? null) as Record<string, unknown> | null;
  const catRaw = antes?.categorias;
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
  const categoria =
    cat && typeof cat === "object"
      ? {
          nombre: String((cat as { nombre?: unknown }).nombre ?? ""),
          slug: String((cat as { slug?: unknown }).slug ?? ""),
          emoji: String((cat as { emoji?: unknown }).emoji ?? "🏪"),
        }
      : null;
  const slug = String(antes?.slug ?? "");

  if (categoria?.slug && slug) {
    revalidatePath(`/${categoria.slug}/${slug}`);
    revalidatePath(`/${categoria.slug}`);
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/negocio/${id}`);
  revalidatePath("/");
  revalidatePath("/mapa");

  // El aviso al dueño va solo cuando el plan realmente sube, no en cada
  // reactivacion, y solo si dejo correo. Nunca voltea el cambio de plan.
  const email = (antes?.email as string | null) ?? null;
  if (plan === "premium" && !eraPremiumPrevio && email && categoria) {
    try {
      const links = await generarTokenDueno(id, { email, ip: "admin-premium" });
      await sendOwnerPremiumNotification({
        nombre: String(antes?.nombre ?? ""),
        slug,
        email,
        categoria,
        premiumHasta,
        tieneWhatsApp: Boolean(antes?.whatsapp),
        statsUrl: links?.statsUrl,
        editarUrl: links?.editarUrl,
      });
    } catch (err) {
      console.error("[cambiarPlanNegocio] aviso de premium fallo:", err);
    }
  }
}

export async function activarPremium(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const duracion = String(formData.get("duracion") ?? "");
  if (!id) return;

  const dias = duracion === "365" ? 365 : duracion === "30" ? 30 : 0;
  if (!dias) return;

  await cambiarPlanNegocio(id, "premium", vencimientoEnDias(dias));
}

// Compatibilidad con enlaces/acciones antiguas que todavía puedan apuntar a 30 días.
export async function activarPremium30Dias(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await cambiarPlanNegocio(id, "premium", vencimientoEnDias(30));
}

export async function quitarPremium(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await cambiarPlanNegocio(id, "basico", null);
}

export async function eliminarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Recoger todas las URLs antes de borrar las filas (foto_portada + galeria)
  const [{ data: negocio }, { data: fotos }] = await Promise.all([
    supabaseAdmin
      .from("negocios")
      .select("nombre, slug, activo, verificado, plan, foto_portada")
      .eq("id", id)
      .maybeSingle(),
    supabaseAdmin.from("fotos").select("url").eq("negocio_id", id),
  ]);

  const urls: string[] = [];
  const portada = (negocio as { foto_portada?: string | null } | null)
    ?.foto_portada;
  if (portada) urls.push(portada);
  for (const f of (fotos ?? []) as Array<{ url: string }>) {
    if (f.url) urls.push(f.url);
  }

  // Borrar la fila (cascadea fotos por FK on delete cascade) y luego limpiar Storage
  const { data: eliminado, error: deleteError } = await supabaseAdmin.from("negocios").delete().eq("id", id).select("id, nombre, slug, activo, verificado, plan").maybeSingle();
  if (deleteError) throw new Error(`No se pudo eliminar la ficha: ${deleteError.message}`);
  await logAuditServer({ action: "DELETE", entityType: "negocios", entityId: id, before: (eliminado as Record<string, unknown> | null) ?? {}, after: {}, reason: "Eliminación de ficha" });
  if (urls.length > 0) {
    await deleteFotosFromStorage(urls);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function logoutAction(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin/login");
}

// ===== RESENAS =====

export async function aprobarResena(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Traemos la reseña + datos del negocio (email, nombre, slug, categoría).
  const { data } = await supabaseAdmin
    .from("resenas")
    .select(
      "negocio_id, autor_nombre, estrellas, comentario, negocios:negocio_id(nombre, slug, email, categorias:categoria_id(slug))",
    )
    .eq("id", id)
    .single();

  const { error: updateError } = await supabaseAdmin
    .from("resenas")
    .update({ aprobada: true })
    .eq("id", id);
  if (updateError) throw new Error(`No se pudo aprobar la reseña: ${updateError.message}`);
  await logAuditServer({ action: "UPDATE", entityType: "resenas", entityId: id, before: { aprobada: false }, after: { aprobada: true }, reason: "Aprobación de reseña" });

  revalidatePath("/admin/resenas");

  if (data) {
    const negRaw = (data as { negocios: unknown }).negocios;
    const neg = Array.isArray(negRaw) ? negRaw[0] : negRaw;
    if (neg && typeof neg === "object") {
      const slug = String((neg as { slug?: unknown }).slug ?? "");
      const nombre = String((neg as { nombre?: unknown }).nombre ?? "");
      const email = (neg as { email?: unknown }).email;
      const catRaw = (neg as { categorias?: unknown }).categorias;
      const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
      const catSlug =
        cat && typeof cat === "object"
          ? String((cat as { slug?: unknown }).slug ?? "")
          : "";
      if (slug && catSlug) {
        revalidatePath(`/${catSlug}/${slug}`);
      }
      if (email && typeof email === "string" && slug && catSlug) {
        const resenaData = data as {
          autor_nombre: string;
          estrellas: number;
          comentario: string | null;
        };
        void sendOwnerResenaAprobadaNotification({
          ownerEmail: email,
          negocioNombre: nombre,
          categoriaSlug: catSlug,
          negocioSlug: slug,
          autorNombre: resenaData.autor_nombre,
          estrellas: resenaData.estrellas,
          comentario: resenaData.comentario,
        });
      }
    }
  }
}

export async function rechazarResena(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { data: eliminada, error } = await supabaseAdmin.from("resenas").delete().eq("id", id).select("id, negocio_id, autor_nombre, estrellas").maybeSingle();
  if (error) throw new Error(`No se pudo rechazar la reseña: ${error.message}`);
  await logAuditServer({ action: "DELETE", entityType: "resenas", entityId: id, before: (eliminada as Record<string, unknown> | null) ?? {}, after: {}, reason: "Rechazo de reseña" });
  revalidatePath("/admin/resenas");
}

export async function resolverReporte(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nuevo = formData.get("nuevo_estado") === "true";
  if (!id) return;
  const { data: antes } = await supabaseAdmin.from("reportes").select("resuelto, resuelto_en").eq("id", id).maybeSingle();
  const { error } = await supabaseAdmin
    .from("reportes")
    .update({
      resuelto: nuevo,
      resuelto_en: nuevo ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(`No se pudo actualizar el reporte: ${error.message}`);
  await logAuditServer({ action: "UPDATE", entityType: "reportes", entityId: id, before: (antes as Record<string, unknown> | null) ?? {}, after: { resuelto: nuevo, resuelto_en: nuevo ? "now" : null }, reason: nuevo ? "Resolución de reporte" : "Reapertura de reporte" });
  revalidatePath("/admin/reportes");
  revalidatePath("/admin");
}

export async function eliminarReporte(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { data: eliminado, error } = await supabaseAdmin.from("reportes").delete().eq("id", id).select("id, negocio_id, resuelto").maybeSingle();
  if (error) throw new Error(`No se pudo eliminar el reporte: ${error.message}`);
  await logAuditServer({ action: "DELETE", entityType: "reportes", entityId: id, before: (eliminado as Record<string, unknown> | null) ?? {}, after: {}, reason: "Eliminación de reporte" });
  revalidatePath("/admin/reportes");
  revalidatePath("/admin");
}

export async function toggleVecinoVerificado(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nuevo = formData.get("nuevo_estado") === "true";
  if (!id) return;

  const { data } = await supabaseAdmin
    .from("resenas")
    .select(
      "negocio_id, negocios:negocio_id(slug, categorias:categoria_id(slug))",
    )
    .eq("id", id)
    .single();

  const { data: antes } = await supabaseAdmin.from("resenas").select("vecino_verificado").eq("id", id).maybeSingle();
  const { error } = await supabaseAdmin
    .from("resenas")
    .update({ vecino_verificado: nuevo })
    .eq("id", id);
  if (error) throw new Error(`No se pudo actualizar la verificación del vecino: ${error.message}`);
  await logAuditServer({ action: "UPDATE", entityType: "resenas", entityId: id, before: { vecino_verificado: (antes as { vecino_verificado?: unknown } | null)?.vecino_verificado ?? null }, after: { vecino_verificado: nuevo }, reason: nuevo ? "Marcar vecino verificado" : "Quitar verificación de vecino" });

  revalidatePath("/admin/resenas");

  if (data) {
    const negRaw = (data as { negocios: unknown }).negocios;
    const neg = Array.isArray(negRaw) ? negRaw[0] : negRaw;
    if (neg && typeof neg === "object") {
      const slug = String((neg as { slug?: unknown }).slug ?? "");
      const catRaw = (neg as { categorias?: unknown }).categorias;
      const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
      const catSlug =
        cat && typeof cat === "object"
          ? String((cat as { slug?: unknown }).slug ?? "")
          : "";
      if (slug && catSlug) revalidatePath(`/${catSlug}/${slug}`);
    }
  }
}

export async function guardarResultadoNegocio(formData: FormData): Promise<void> {
  await requireAdmin();

  const negocioId = String(formData.get("negocio_id") ?? "");
  const periodo = String(formData.get("periodo") ?? "");
  if (!negocioId || !esPeriodoValido(periodo)) return;

  const consultas = contarReportado(formData.get("consultas"));
  const clientes = contarReportado(formData.get("clientes"));
  const nota = limpiarNota(formData.get("nota"));

  const { data: antes } = await supabaseAdmin
    .from("resultados_negocio")
    .select("id, negocio_id, periodo, consultas, clientes, nota")
    .eq("negocio_id", negocioId)
    .eq("periodo", periodo)
    .maybeSingle();

  if (consultas === null && clientes === null && nota === null) return;

  const { error } = await supabaseAdmin
    .from("resultados_negocio")
    .upsert(
      { negocio_id: negocioId, periodo, consultas, clientes, nota },
      { onConflict: "negocio_id,periodo" }
    );

  if (error) {
    console.error("[guardarResultadoNegocio] error:", error.message);
    return;
  }

  await logAuditServer({
    action: "UPDATE",
    entityType: "resultados_negocio",
    entityId: String((antes as { id?: unknown } | null)?.id ?? negocioId + ":" + periodo),
    before: (antes as Record<string, unknown> | null) ?? {},
    after: {
      negocio_id: negocioId,
      periodo,
      consultas,
      clientes,
      nota,
    },
    reason: "Guardar resultado reportado por negocio",
  });

  revalidatePath("/admin/resultados");
}

export async function borrarResultadoNegocio(formData: FormData): Promise<void> {
  await requireAdmin();

  const negocioId = String(formData.get("negocio_id") ?? "");
  const periodo = String(formData.get("periodo") ?? "");
  if (!negocioId || !esPeriodoValido(periodo)) return;

  const { data: antes } = await supabaseAdmin
    .from("resultados_negocio")
    .select("id, negocio_id, periodo, consultas, clientes, nota")
    .eq("negocio_id", negocioId)
    .eq("periodo", periodo)
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from("resultados_negocio")
    .delete()
    .eq("negocio_id", negocioId)
    .eq("periodo", periodo);

  if (error) {
    console.error("[borrarResultadoNegocio] error:", error.message);
    return;
  }

  if (antes) {
    await logAuditServer({
      action: "DELETE",
      entityType: "resultados_negocio",
      entityId: String((antes as { id?: unknown }).id ?? negocioId + ":" + periodo),
      before: antes as Record<string, unknown>,
      after: {},
      reason: "Eliminar resultado reportado por negocio",
    });
  }

  revalidatePath("/admin/resultados");
}

export async function pedirResultadoPorWhatsApp(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("negocio_id") ?? "");
  const mes = String(formData.get("mes") ?? "");
  if (!id) return;

  const { data } = await supabaseAdmin
    .from("negocios")
    .select("nombre, whatsapp, telefono")
    .eq("id", id)
    .single();

  const negocio = (data ?? null) as {
    nombre?: string;
    whatsapp?: string | null;
    telefono?: string | null;
  } | null;
  if (!negocio) return;

  const linkUrl = await generarLinkResultados(id);
  if (!linkUrl) return;

  const mensaje =
    `Hola${negocio.nombre ? ` ${negocio.nombre}` : ""}! Soy de LinaresYa. ` +
    `Queria saber como te fue${mes ? ` en ${mes}` : ""} con la gente que llego por el ` +
    `directorio. Son dos preguntas, te tomas 30 segundos: ${linkUrl}`;

  const destino =
    whatsAppLink(negocio.whatsapp, mensaje) ?? whatsAppLink(negocio.telefono, mensaje);
  if (!destino) return;

  redirect(destino);
}
