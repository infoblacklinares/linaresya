"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type DejarResenaState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

// Rate limiting muy basico en memoria por IP. No sobrevive a restarts ni a
// instancias serverless multiples, pero filtra el spam mas obvio. Si llega a
// hacer falta algo serio se mete Upstash Redis.
const ipBuffer = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const arr = ipBuffer.get(ip) ?? [];
  const reciente = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (reciente.length >= RATE_LIMIT_MAX) return false;
  reciente.push(now);
  ipBuffer.set(ip, reciente);
  return true;
}

export async function dejarResena(
  _prev: DejarResenaState,
  formData: FormData,
): Promise<DejarResenaState> {
  const negocioId = String(formData.get("negocio_id") ?? "").trim();
  const categoriaSlug = String(formData.get("categoria_slug") ?? "").trim();
  const negocioSlug = String(formData.get("negocio_slug") ?? "").trim();
  const nombre = String(formData.get("nombre_autor") ?? "").trim();
  const calificacionRaw = String(formData.get("calificacion") ?? "").trim();
  const comentario = String(formData.get("comentario") ?? "").trim();

  // Honeypot: si un bot llena el campo "website", lo rechazamos en silencio
  // (devolvemos ok=true para no darle pista de que fue detectado).
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true };
  }

  if (!negocioId) {
    return { ok: false, error: "Falta el negocio" };
  }

  const fieldErrors: Record<string, string> = {};
  if (nombre.length < 2) fieldErrors.nombre_autor = "Minimo 2 caracteres";
  if (nombre.length > 60) fieldErrors.nombre_autor = "Maximo 60 caracteres";

  const calificacion = Number(calificacionRaw);
  if (
    !Number.isInteger(calificacion) ||
    calificacion < 1 ||
    calificacion > 5
  ) {
    fieldErrors.calificacion = "Elige 1 a 5 estrellas";
  }

  if (comentario.length > 500) {
    fieldErrors.comentario = "Maximo 500 caracteres";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: "Revisa los campos marcados" };
  }

  // Verificar que el negocio existe y esta activo. Sino, el form puede haber
  // venido de una ficha cacheada de algo que ya no se ve.
  const { data: negocio } = await supabaseAdmin
    .from("negocios")
    .select("id,activo")
    .eq("id", negocioId)
    .single();
  if (!negocio || !(negocio as { activo: boolean }).activo) {
    return { ok: false, error: "Negocio no disponible" };
  }

  // Rate limit por IP para evitar spam.
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(ip)) {
    return {
      ok: false,
      error: "Demasiadas resenas en poco tiempo. Espera un minuto.",
    };
  }

  const { error } = await supabaseAdmin.from("resenas").insert({
    negocio_id: negocioId,
    nombre_autor: nombre,
    calificacion,
    comentario: comentario || null,
    aprobada: false,
  });

  if (error) {
    console.error("[dejarResena] Supabase insert error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      payload: {
        negocio_id: negocioId,
        nombre_autor: nombre,
        calificacion,
        comentario_length: comentario.length,
      },
    });
    return {
      ok: false,
      error: `No pudimos guardar tu resena: ${error.message}`,
    };
  }

  // Revalida la ficha publica por si se aprueba rapido (admin la activa y
  // queremos que aparezca al refrescar).
  if (categoriaSlug && negocioSlug) {
    revalidatePath(`/${categoriaSlug}/${negocioSlug}`);
  }

  return { ok: true };
}
