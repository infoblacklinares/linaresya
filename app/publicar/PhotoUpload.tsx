"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function PhotoUpload({
  name,
  label,
  hint,
  required = false,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      setError("Tipo no soportado. Usa JPG, PNG o WEBP.");
      e.target.value = "";
      setPreview(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        `Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximo 4 MB.`,
      );
      e.target.value = "";
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function handleRemove() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
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
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/70 text-white text-sm flex items-center justify-center hover:bg-black/85 transition"
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
            name={name}
            accept={ACCEPTED.join(",")}
            required={required}
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

      {error && (
        <p className="mt-1 text-[11px] text-red-600 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
