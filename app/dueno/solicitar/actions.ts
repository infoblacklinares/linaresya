"use server";

import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendDuenoMagicLink } from "@/lib/email";

export type SolicitarState = {
  ok: boolean;
  error?: string;
};

const EXPIRA_HORAS = 24;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

// Rate limit en memoria por IP. 3 solicitudes por hora.
const ipBuffer = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 3;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const arr = ipBuffer.get(ip) ?? [];
  const recientes = arr.filter((t) => now - t < RATE_WINDOW_MS);
  if (recientes.length >= RATE_MAX) return false;
  recientes.push(now);
  ipBuffer.set(ip, recientes);
  return true;
}

export async function solicitarMagicLink(
  _prev: SolicitarState,
  formData: FormData,
): Promise<SolicitarState> {
  const emailRaw = String(formData.get("email") ?? "").trim().toLowerCase();
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_RE.test(emailRaw)) {
    return { ok: false, error: "Email invalido" };
  }

  // Rate limit por IP
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(ip)) {
    return {
      ok: false,
      error: "Demasiadas solicitudes. Intenta de nuevo en 1 hora.",
    };
  }

  // Buscar negocios activos con ese email
  const { data: negocios } = await supabaseAdmin
    .from("negocios")
    .select("id, nombre, email")
    .eq("email", emailRaw)
    .eq("activo", true);

  // Importante: NO revelamos si el email existe o no. Si no hay match,
  // devolvemos ok igual para no permitir enumerar emails.
  if (!negocios || negocios.length === 0) {
    return { ok: true };
  }

  // Para cada negocio matcheado, generamos un token y mandamos email.
  // Si el dueno tiene varios negocios con el mismo email, recibe varios
  // links (uno por negocio). En la practica esto va a ser raro.
  for (const negocio of negocios as Array<{
    id: string;
    nombre: string;
    email: string;
  }>) {
    const token = randomBytes(24).toString("hex"); // 48 chars hex
    const expiraEn = new Date(
      Date.now() + EXPIRA_HORAS * 60 * 60 * 1000,
    ).toISOString();

    const { error: insertError } = await supabaseAdmin
      .from("dueno_tokens")
      .insert({
        negocio_id: negocio.id,
        token,
        email_solicitado: emailRaw,
        expira_en: expiraEn,
        ip,
      });

    if (insertError) {
      console.error("[solicitarMagicLink] insert error:", insertError);
      continue;
    }

    const link = `${SITE_URL}/dueno/editar/${token}`;
    await sendDuenoMagicLink({
      to: emailRaw,
      nombreNegocio: negocio.nombre,
      link,
      expiraHoras: EXPIRA_HORAS,
    });
  }

  return { ok: true };
}
