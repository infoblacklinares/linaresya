import { supabaseAdmin } from "./supabase-admin";

const BUCKET = "negocios";
const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Sanitiza un fragmento de path: solo letras/numeros/guiones, lowercase.
function safeFragment(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40) || "sin-nombre";
}

// Sube un archivo al bucket de Storage. Devuelve la URL publica o null si:
// - el File es vacio (caso usuario que no subio nada)
// - el tipo MIME no esta permitido
// - el archivo supera 8 MB
// - hubo error de Storage
//
// Nunca tira: errores se devuelven como null para no romper el flujo del
// formulario completo si una sola foto falla.
export async function uploadNegocioFoto(
  file: File | null,
  negocioSlug: string,
  carpeta: "portada" | "galeria",
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ACCEPTED_MIMES.has(file.type)) return null;
  if (file.size > MAX_BYTES) return null;

  const ext = EXT_BY_MIME[file.type] ?? "jpg";
  const slug = safeFragment(negocioSlug);
  const random = Math.random().toString(36).slice(2, 10);
  // Path: negocios/{slug}/portada-{rand}.jpg  o  negocios/{slug}/galeria/{rand}.jpg
  const path =
    carpeta === "portada"
      ? `${slug}/portada-${Date.now()}-${random}.${ext}`
      : `${slug}/galeria/${Date.now()}-${random}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading to Storage:", error);
    return null;
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

// Sube una lista de archivos en paralelo. Filtra los nulls.
export async function uploadNegocioGaleria(
  files: File[],
  negocioSlug: string,
): Promise<string[]> {
  const urls = await Promise.all(
    files.map((f) => uploadNegocioFoto(f, negocioSlug, "galeria")),
  );
  return urls.filter((u): u is string => !!u);
}
