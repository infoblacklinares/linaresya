"use client";

import { useRef } from "react";

/**
 * Botón de eliminación con confirmación nativa antes de enviar el form.
 * Uso: envuelve la action de eliminación para evitar borrados accidentales.
 */
export default function ConfirmDeleteButton({
  action,
  id,
  label = "Eliminar",
  mensaje = "¿Seguro que quieres eliminar esto? Esta acción es irreversible.",
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string | number;
  label?: string;
  mensaje?: string;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(mensaje)) {
      e.preventDefault();
    }
  }

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={
          className ??
          "rounded-full bg-rose-100 text-rose-800 text-xs font-semibold px-4 py-2 hover:bg-rose-200 transition"
        }
      >
        {label}
      </button>
    </form>
  );
}
