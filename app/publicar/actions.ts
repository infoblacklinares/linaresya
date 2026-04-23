"use server";

import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type PublicarState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

// Verifica el token de Cloudflare Turnstile. Si no hay TURNSTILE_SECRET_KEY
// configurada devuelve true (modo dev sin captcha).
async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const body = new URLSearchParams();
    body.append("secret", secret);
    body.append("response", token);
    if (ip) body.append("remoteip", ip);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      },
    );
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

// Normaliza texto a slug: minusculas, sin acentos, sin simbolos, guiones.
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

// Normaliza numero de WhatsApp a formato internacional sin +.
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
  // Captcha (Cloudflare Turnstile). Si no hay secret config, se salta.
  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    null;
  const captchaOk = await verifyTurnstile(turnstileToken, ip);
  if (!captchaOk) {
    return {
      ok: false,
      error: "No pudimos verificar que no eres un bot. Recarga e intenta otra vez.",
    };
  }

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

  // Validacion
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
    activo: false,
    verificado: false,
    telefono: telefono || null,
    whatsapp,
    email: null,
    sitio_web: null,
    direccion: direccion || null,
    ciudad: "Linares",
    comuna: "Linares",
    region: "Maule",
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
