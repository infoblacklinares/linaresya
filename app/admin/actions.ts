"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { clearAdminCookie, isAdminAuthenticated } from "@/lib/admin-auth";
import { sendOwnerAprobacionNotification, sendOwnerResenaAprobadaNotification } from "@/lib/email";
import { deleteFotosFromStorage } from "@/lib/storage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linaresya.cl";
const TOKEN_EXPIRA_HORAS = 72; // 3 días — más cómodo que 24 hs para el primer acceso

/**
 * Genera un magic link token para el dueño y devuelve las URLs de editar y stats.
 * Si algo falla, devuelve null silenciosamente (no queremos romper la aprobación).
 */
async function generarTokenDueno(
  negocioId: string,
  email: string,
): Promise<{ editarUrl: string; statsUrl: string } | null> {
  try {
    const token = randomBytes(24).toString("hex");
    const expiraEn = new Date(
      Date.now() + TOKEN_EXPIRA_HORAS * 60 * 60 * 1000,
    ).toISOString();
    const { error } = await supabaseAdmin.from("dueno_tokens").insert({
      negocio_id: negocioId,
      token,
      email_solicitado: email,
      expira_en: expiraEn,
      ip: "admin-auto",
    });
    if (error) {
      console.error("[generarTokenDueno] error:", error);
      return null;
    }
    return {
      editarUrl: `${SITE_URL}/dueno/editar/${token}`,
      statsUrl:  `${SITE_URL}/dueno/estadisticas/${token}`,
    };
  } catch (err) {
    console.error("[generarTokenDueno] excepcion:", err);
    return null;
  }
}

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
      "nombre, slug, email, activo, categorias:categoria_id(nombre, slug, emoji)",
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
    const links = await generarTokenDueno(negocioId, antes.email);
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
  await supabaseAdmin.from("negocios").update({ activo: true }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
  if (antes) await notificarSiCorresponde(antes, id, false);
}

export async function verificarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const antes = await fetchNegocioParaAprobar(id);
  await supabaseAdmin
    .from("negocios")
    .update({ activo: true, verificado: true })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
  if (antes) await notificarSiCorresponde(antes, id, true);
}

export async function desactivarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabaseAdmin.from("negocios").update({ activo: false }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function eliminarNegocio(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Recoger todas las URLs antes de borrar las filas (foto_portada + galeria)
  const [{ data: negocio }, { data: fotos }] = await Promise.all([
    supabaseAdmin
      .from("negocios")
      .select("foto_portada")
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
  await supabaseAdmin.from("negocios").delete().eq("id", id);
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

  await supabaseAdmin
    .from("resenas")
    .update({ aprobada: true })
    .eq("id", id);

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
      // Notificar al dueño del negocio si tiene email registrado.
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
  // Borramos directo: rechazar = no la queremos en la tabla.
  await supabaseAdmin.from("resenas").delete().eq("id", id);
  revalidatePath("/admin/resenas");
}

// ===== REPORTES =====

export async function resolverReporte(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nuevo = formData.get("nuevo_estado") === "true";
  if (!id) return;
  await supabaseAdmin
    .from("reportes")
    .update({
      resuelto: nuevo,
      resuelto_en: nuevo ? new Date().toISOString() : null,
    })
    .eq("id", id);
  revalidatePath("/admin/reportes");
  revalidatePath("/admin");
}

export async function eliminarReporte(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabaseAdmin.from("reportes").delete().eq("id", id);
  revalidatePath("/admin/reportes");
  revalidatePath("/admin");
}

export async function toggleVecinoVerificado(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nuevo = formData.get("nuevo_estado") === "true";
  if (!id) return;

  // Actualizamos el flag y revalidamos la ficha publica si conocemos su slug.
  const { data } = await supabaseAdmin
    .from("resenas")
    .select(
      "negocio_id, negocios:negocio_id(slug, categorias:categoria_id(slug))",
    )
    .eq("id", id)
    .single();

  await supabaseAdmin
    .from("resenas")
    .update({ vecino_verificado: nuevo })
    .eq("id", id);

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
