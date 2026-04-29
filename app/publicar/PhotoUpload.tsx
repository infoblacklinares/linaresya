"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "negocios";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type Status = "idle" | "uploading" | "done" | "error";

export default function PhotoUpload({
  name,
  label,
  hint,
  required = false,
  initialUrl,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  initialUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [publicUrl, setPublicUrl] = useState<string>(initialUrl ?? "");
  const [status, setStatus] = useState<Status>(initialUrl ? "done" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [isExisting, setIsExisting] = useState<boolean>(!!initialUrl);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) {
      reset();
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      setError("Tipo no soportado. Usa JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        `Archivo muy grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximo 4 MB.`,
      );
      return;
    }

    // Mostrar preview inmediatamente
    setPreview(URL.createObjectURL(file));
    setStatus("uploading");
    setIsExisting(false);

    // Subir directo a Supabase Storage (bypass Vercel)
    try {
      const ext = EXT_BY_MIME[file.type] ?? "jpg";
      const random = Math.random().toString(36).slice(2, 10);
      const path = `uploads/${Date.now()}-${random}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          contentType: file.type,
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError(`Error al subir: ${uploadError.message}`);
        setStatus("error");
        return;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const url = data?.publicUrl ?? "";
      if (!url) {
        setError("No se pudo obtener la URL publica");
        setStatus("error");
        return;
      }
      setPublicUrl(url);
      setStatus("done");
    } catch (err) {
      console.error("Upload exception:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStatus("error");
    }
  }

  function reset() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setPublicUrl("");
    setStatus("idle");
    setError(null);
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-40 object-cover"
          />
          {status === "uploading" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
                Subiendo...
              </div>
            </div>
          )}
          {status === "done" && !isExisting && (
            <div className="absolute top-2 left-2 rounded-full bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5">
              Subida
            </div>
          )}
          {status === "done" && isExisting && (
            <div className="absolute top-2 left-2 rounded-full bg-black/70 text-white text-[10px] font-bold px-2 py-0.5">
              Actual
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 bg-rose-500/20 border-2 border-rose-500 rounded-2xl" />
          )}
          <button
            type="button"
            onClick={reset}
            disabled={status === "uploading"}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/70 text-white text-sm flex items-center justify-center hover:bg-black/85 transition disabled:opacity-50"
            aria-label="Quitar foto"
          >
            {"×"}
          </button>
        </div>
      ) : (
        <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-secondary/30 hover:bg-secondary/50 transition px-4 py-6 text-center">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={handleChange}
            className="sr-only"
          />
          <div className="text-2xl mb-1">{"📷"}</div>
          <p className="text-[13px] font-semibold">Subir foto</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            JPG, PNG o WEBP - hasta 4 MB
          </p>
        </label>
      )}

      {/* Hidden input que viaja al server action con la URL ya subida */}
      <input type="hidden" name={name} value={publicUrl} />
      {/* required logico: si required y no hay URL aun, el form lo bloquea */}
      {required && !publicUrl && (
        <input
          type="text"
          required
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          value=""
          readOnly
        />
      )}

      {error && (
        <p className="mt-1 text-[11px] text-red-600 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
