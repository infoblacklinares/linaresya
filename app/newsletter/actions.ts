"use server";

import { Resend } from "resend";

export type NewsletterState = {
  ok: boolean;
  error?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function suscribirNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Email inválido." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  // Si no están configuradas las vars, lo logueamos y devolvemos ok
  // para no romper la UX (en dev o previews sin newsletter configurado).
  if (!apiKey || !audienceId) {
    console.warn(
      "[newsletter] Suscripcion recibida pero RESEND_API_KEY o RESEND_AUDIENCE_ID no configurados.",
      { email },
    );
    return { ok: true };
  }

  try {
    const resend = new Resend(apiKey);

    // Resend Contacts API — agrega o actualiza el contacto en la audiencia.
    // unsubscribed: false para asegurar que quede activo incluso si ya existe.
    const { error } = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: false,
    });

    if (error) {
      // Resend devuelve error "Contact already exists" como error, pero para
      // nosotros es OK — el contacto ya está en la lista.
      const msg = String((error as { message?: unknown }).message ?? "");
      if (/already exists/i.test(msg)) {
        return { ok: true };
      }
      console.error("[newsletter] Resend contacts error:", error);
      return { ok: false, error: "No pudimos registrarte. Intentá de nuevo." };
    }

    return { ok: true };
  } catch (err) {
    console.error("[newsletter] excepción:", err);
    return { ok: false, error: "Error inesperado. Intentá de nuevo." };
  }
}
