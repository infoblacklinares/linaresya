"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  updateNegocioDueno,
  type DuenoUpdateState,
} from "./actions";
import ScheduleInput, {
  type HorarioInicial,
} from "@/app/publicar/ScheduleInput";
import PhotoUpload from "@/app/publicar/PhotoUpload";
import GaleriaManager from "@/app/admin/negocio/[id]/editar/GaleriaManager";

const estadoInicial: DuenoUpdateState = { ok: false };

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  a_domicilio: boolean;
  zona_cobertura: string | null;
  disponibilidad: string | null;
  foto_portada: string | null;
};

type FotoGaleria = {
  id: number;
  url: string;
  orden: number;
};

export default function DuenoEditForm({
  token,
  negocio,
  horarios,
  fotosGaleria,
  fichaUrl,
}: {
  token: string;
  negocio: Negocio;
  horarios: HorarioInicial[];
  fotosGaleria: FotoGaleria[];
  fichaUrl: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateNegocioDueno,
    estadoInicial,
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6 pb-8">
      <input type="hidden" name="token" value={token} />

      {state.ok && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm font-medium">
          Cambios guardados.{" "}
          <Link
            href={fichaUrl}
            className="underline font-bold"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver mi ficha publicada
          </Link>
        </div>
      )}
      {state.error && !state.ok && (
        <div className="rounded-2xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm font-medium">
          {state.error}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Datos basicos
        </h2>
        <Field label="Nombre" required error={fe.nombre}>
          <input
            name="nombre"
            defaultValue={negocio.nombre}
            required
            minLength={3}
            maxLength={80}
            className="input-ue"
          />
        </Field>
        <Field
          label="Descripcion"
          hint="Que ofreces, lo que te distingue..."
          error={fe.descripcion}
        >
          <textarea
            name="descripcion"
            defaultValue={negocio.descripcion ?? ""}
            rows={4}
            maxLength={1000}
            className="input-ue resize-none"
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Contacto
        </h2>
        <Field label="Telefono">
          <input
            name="telefono"
            type="tel"
            defaultValue={negocio.telefono ?? ""}
            className="input-ue"
            placeholder="+56 9 1234 5678"
          />
        </Field>
        <Field label="WhatsApp" hint="Solo numero, se usa para el boton WhatsApp">
          <input
            name="whatsapp"
            type="tel"
            defaultValue={negocio.whatsapp ?? ""}
            className="input-ue"
            placeholder="9 1234 5678"
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Ubicacion y servicio
        </h2>
        <Field label="Direccion">
          <input
            name="direccion"
            defaultValue={negocio.direccion ?? ""}
            className="input-ue"
            placeholder="Ej: Independencia 123, Linares"
          />
        </Field>
        <Field label="">
          <label className="flex items-center gap-3 rounded-2xl bg-secondary/50 px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              name="a_domicilio"
              defaultChecked={negocio.a_domicilio}
              className="h-4 w-4 accent-foreground"
            />
            <span className="text-sm font-medium">Atiendo a domicilio</span>
          </label>
        </Field>
        <Field
          label="Zona de cobertura"
          hint="Si vas a domicilio: que sectores cubris"
          error={fe.zona_cobertura}
        >
          <input
            name="zona_cobertura"
            defaultValue={negocio.zona_cobertura ?? ""}
            maxLength={200}
            className="input-ue"
            placeholder="Ej: Todo Linares urbano"
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Foto de portada
        </h2>
        <PhotoUpload
          name="foto_portada"
          label=""
          hint="Click para reemplazar"
          initialUrl={negocio.foto_portada}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Galeria
        </h2>
        <p className="text-[12px] font-semibold mb-1">Fotos actuales</p>
        <GaleriaManager fotos={fotosGaleria} />
        <p className="text-[12px] font-semibold mb-1 mt-3">Agregar nuevas</p>
        <div className="grid grid-cols-2 gap-3">
          <PhotoUpload name="foto_galeria_1" label="" />
          <PhotoUpload name="foto_galeria_2" label="" />
          <PhotoUpload name="foto_galeria_3" label="" />
          <PhotoUpload name="foto_galeria_4" label="" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Horarios
        </h2>
        <ScheduleInput initialHorarios={horarios} />
        <Field
          label="Nota de horario"
          hint="Opcional - ej: 'Cerrado feriados', 'Solo con cita'"
          error={fe.disponibilidad}
        >
          <input
            name="disponibilidad"
            defaultValue={negocio.disponibilidad ?? ""}
            maxLength={120}
            className="input-ue"
          />
        </Field>
      </section>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-border -mx-4 px-4 py-3">
        <button
          type="submit"
          disabled={pending}
          className="w-full py-4 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
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
