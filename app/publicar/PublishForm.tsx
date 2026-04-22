"use client";

import { useActionState } from "react";
import { publicarNegocio, type PublicarState } from "./actions";

type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  emoji: string;
};

const estadoInicial: PublicarState = { ok: false };

export default function PublishForm({ categorias }: { categorias: Categoria[] }) {
  const [state, formAction, isPending] = useActionState(publicarNegocio, estadoInicial);

  if (state.ok) {
    return (
      <div className="mx-4 mt-6 rounded-3xl ue-shadow bg-white p-8 text-center">
        <div className="text-5xl mb-3">{"\u{2705}"}</div>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Solicitud enviada
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gracias por sumarte. Revisaremos tu negocio y lo activaremos en las proximas horas.
        </p>
        <a
          href="/"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold px-5 py-2.5"
        >
          Volver al inicio
        </a>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="px-4 pb-10 pt-2 space-y-5">
      {state.error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <Field label="Nombre del negocio" required error={fe.nombre}>
        <input
          type="text"
          name="nombre"
          required
          minLength={3}
          maxLength={80}
          placeholder="Ej: Pizzeria Don Vittorio"
          className="input-ue"
        />
      </Field>

      <Field label="Categoria" required error={fe.categoria_id}>
        <select name="categoria_id" required className="input-ue">
          <option value="">Selecciona una categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.nombre}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tipo">
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-4 py-3 cursor-pointer has-[:checked]:border-foreground has-[:checked]:bg-white">
            <input type="radio" name="tipo" value="negocio" defaultChecked className="accent-foreground" />
            <span className="text-sm font-medium">Negocio / Local</span>
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-4 py-3 cursor-pointer has-[:checked]:border-foreground has-[:checked]:bg-white">
            <input type="radio" name="tipo" value="independiente" className="accent-foreground" />
            <span className="text-sm font-medium">Independiente</span>
          </label>
        </div>
      </Field>

      <Field label="Descripcion corta" hint="Opcional - maximo 500 caracteres" error={fe.descripcion}>
        <textarea
          name="descripcion"
          rows={3}
          maxLength={500}
          placeholder="Que ofreces, estilo, lo que te distingue..."
          className="input-ue resize-none"
        />
      </Field>

      <Field label="Telefono" hint="Opcional">
        <input
          type="tel"
          name="telefono"
          placeholder="+56 9 1234 5678"
          className="input-ue"
        />
      </Field>

      <Field label="WhatsApp" hint="Solo numero, se usa para el boton WhatsApp">
        <input
          type="tel"
          name="whatsapp"
          placeholder="9 1234 5678"
          className="input-ue"
        />
      </Field>

      <Field label="Direccion" hint="Opcional si trabajas solo a domicilio">
        <input
          type="text"
          name="direccion"
          placeholder="Ej: Independencia 123, Linares"
          className="input-ue"
        />
      </Field>

      <Field label="">
        <label className="flex items-center gap-3 rounded-2xl bg-secondary/50 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            name="a_domicilio"
            className="h-4 w-4 accent-foreground"
          />
          <span className="text-sm font-medium">Atiendo a domicilio</span>
        </label>
      </Field>

      <Field label="Zona de cobertura" hint="Si vas a domicilio: que sectores cubres">
        <input
          type="text"
          name="zona_cobertura"
          placeholder="Ej: Todo Linares urbano"
          className="input-ue"
        />
      </Field>

      <Field label="Disponibilidad" hint="Cuando estas disponible (resumen)">
        <input
          type="text"
          name="disponibilidad"
          placeholder="Ej: Lun a Sab 9:00 - 19:00"
          className="input-ue"
        />
      </Field>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-foreground text-background text-sm font-semibold px-6 py-4 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? "Enviando..." : "Enviar solicitud"}
        </button>
        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          Al enviar, tu negocio queda pendiente de revision.
          <br />
          Te activaremos en las proximas horas si todo esta en orden.
        </p>
      </div>

      <style>{`
        .input-ue {
          width: 100%;
          background: oklch(0.96 0 0);
          border-radius: 1rem;
          padding: 0.875rem 1rem;
          font-size: 0.875rem;
          outline: none;
          border: 1px solid transparent;
          transition: border-color 0.15s, background 0.15s;
        }
        .input-ue:focus {
          border-color: oklch(0.10 0 0);
          background: #fff;
        }
        .input-ue::placeholder { color: oklch(0.55 0 0); }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required = false,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-[11px] text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
