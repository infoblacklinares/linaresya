"use server";

import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendAdminPublicacionNotification } from "@/lib/email";
import { uploadNegocioFoto, uploadNegocioGaleria } from "@/lib/storage";

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
  const emailRaw = String(formData.get("email") ?? "").trim().toLowerCase();
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

  // Email: opcional, pero si se proveio debe tener forma razonable.
  // Regex simple: algo@algo.algo, 3-120 chars. No pretende ser RFC 5322.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let email: string | null = null;
  if (emailRaw) {
    if (emailRaw.length > 120) {
      fieldErrors.email = "Maximo 120 caracteres";
    } else if (!EMAIL_RE.test(emailRaw)) {
      fieldErrors.email = "Email no parece valido";
    } else {
      email = emailRaw;
    }
  }

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

  const { data: insertado, error } = await supabaseAdmin
    .from("negocios")
    .insert({
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
      email,
      sitio_web: null,
      direccion: direccion || null,
      ciudad: "Linares",
      comuna: "Linares",
      region: "Maule",
      a_domicilio: aDomicilio,
      zona_cobertura: zonaCobertura || null,
      disponibilidad: disponibilidad || null,
    })
    .select("id")
    .single();

  if (error || !insertado) {
    return {
      ok: false,
      error: "No pudimos guardar tu solicitud. Intenta de nuevo en unos minutos.",
    };
  }

  // Parsear las 7 filas de horarios del FormData e insertar en tabla horarios.
  // Cada dia tiene: horario_<dia>_cerrado (checkbox), horario_<dia>_abre (HH:MM),
  // horario_<dia>_cierra (HH:MM). Si el form no incluye nada (caso edge), se
  // omite la insercion y la ficha mostrara "Consultar horario".
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

  const filasHorarios: Array<{
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

    if (cerrado) {
      filasHorarios.push({
        negocio_id: insertado.id as string,
        dia,
        abre: null,
        cierra: null,
        cerrado: true,
      });
      continue;
    }

    // Validacion blanda: si las horas no parsean, marcamos el dia como cerrado
    // en vez de tirar la insercion completa. Asi nunca bloqueamos la publicacion.
    if (!HORA_RE.test(abreRaw) || !HORA_RE.test(cierraRaw)) {
      filasHorarios.push({
        negocio_id: insertado.id as string,
        dia,
        abre: null,
        cierra: null,
        cerrado: true,
      });
      continue;
    }

    filasHorarios.push({
      negocio_id: insertado.id as string,
      dia,
      abre: abreRaw,
      cierra: cierraRaw,
      cerrado: false,
    });
  }

  if (filasHorarios.length > 0) {
    const { error: horariosError } = await supabaseAdmin
      .from("horarios")
      .insert(filasHorarios);
    if (horariosError) {
      // No bloqueamos: el negocio ya quedo creado. El admin puede arreglar
      // los horarios despues desde el panel.
      console.error("Error insertando horarios:", horariosError);
    }
  }

  // Subida de fotos (no bloqueante: si falla Storage, el negocio queda creado).
  // Foto de portada: una sola, opcional.
  const fotoPortadaRaw = formData.get("foto_portada");
  console.log("[publicar] foto_portada raw:", {
    isFile: fotoPortadaRaw instanceof File,
    type: typeof fotoPortadaRaw,
    constructor: fotoPortadaRaw?.constructor?.name,
    size: fotoPortadaRaw instanceof File ? fotoPortadaRaw.size : null,
    mime: fotoPortadaRaw instanceof File ? fotoPortadaRaw.type : null,
    name: fotoPortadaRaw instanceof File ? fotoPortadaRaw.name : null,
  });
  if (fotoPortadaRaw instanceof File && fotoPortadaRaw.size > 0) {
    console.log("[publicar] uploading foto_portada to Storage...");
    const url = await uploadNegocioFoto(fotoPortadaRaw, slug, "portada");
    console.log("[publicar] upload result:", url);
    if (url) {
      await supabaseAdmin
        .from("negocios")
        .update({ foto_portada: url })
        .eq("id", insertado.id as string);
      console.log("[publicar] foto_portada saved to negocio");
    } else {
      console.warn("[publicar] foto_portada upload returned null");
    }
  } else {
    console.log("[publicar] no foto_portada attached or empty");
  }

  // Galeria: hasta 4 archivos en campos foto_galeria_1..4.
  const galeriaFiles: File[] = [];
  for (let i = 1; i <= 4; i++) {
    const f = formData.get(`foto_galeria_${i}`);
    if (f instanceof File && f.size > 0) galeriaFiles.push(f);
  }
  console.log("[publicar] galeria files:", galeriaFiles.length);
  if (galeriaFiles.length > 0) {
    const urls = await uploadNegocioGaleria(galeriaFiles, slug);
    console.log("[publicar] galeria urls:", urls.length);
    if (urls.length > 0) {
      const filasFotos = urls.map((url, idx) => ({
        negocio_id: insertado.id as string,
        url,
        orden: idx,
      }));
      const { error: fotosError } = await supabaseAdmin
        .from("fotos")
        .insert(filasFotos);
      if (fotosError) {
        console.error("Error insertando fotos:", fotosError);
      }
    }
  }

  // Notificar al admin (fire-and-forget). Si falla Resend, no rompemos
  // la publicacion; el negocio ya quedo guardado.
  try {
    const { data: cat } = await supabaseAdmin
      .from("categorias")
      .select("nombre")
      .eq("id", categoriaId)
      .single();

    await sendAdminPublicacionNotification({
      id: insertado.id as string,
      nombre,
      tipo,
      descripcion: descripcion || null,
      telefono: telefono || null,
      whatsapp,
      direccion: direccion || null,
      categoria_nombre: (cat?.nombre as string | undefined) ?? null,
    });
  } catch {
    // Ignorado a proposito: el email nunca debe romper el flujo.
  }

  return { ok: true };
}
