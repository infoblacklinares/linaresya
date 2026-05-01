import { supabaseAdmin } from "./supabase-admin";

const BUCKET = "negocios";
const MAX_BYTES = 4 * 1024 * 1024;
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

// Extrae el path interno del bucket desde una URL publica de Supabase.
// Ej: "https://xxxx.supabase.co/storage/v1/object/public/negocios/slug/portada-123.jpg"
// devuelve "slug/portada-123.jpg". Devuelve null si la URL no pertenece al bucket.
export function extractStoragePath(url: string): string | null {
  if (!url) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!supabaseUrl) return null;
  const prefix = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

// Borra una foto del bucket dada su URL publica. No tira: errores se loguean.
// Devuelve true si borro algo, false si la URL no era valida o si fallo Storage.
export async function deleteFotoFromStorage(url: string): Promise<boolean> {
  const path = extractStoragePath(url);
  if (!path) return false;
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("[storage] Error eliminando archivo:", error.message, path);
    return false;
  }
  return true;
}

// Borra varias fotos en una sola llamada. Mas eficiente que llamar
// deleteFotoFromStorage en loop. Devuelve cantidad efectivamente borrada.
export async function deleteFotosFromStorage(urls: string[]): Promise<number> {
  const paths = urls
    .map(extractStoragePath)
    .filter((p): p is string => !!p);
  if (paths.length === 0) return 0;
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove(paths);
  if (error) {
    console.error("[storage] Error eliminando archivos:", error.message);
    return 0;
  }
  return paths.length;
}
