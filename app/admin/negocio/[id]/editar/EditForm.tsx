"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateNegocio, type UpdateState } from "./actions";
import ScheduleInput, { type HorarioInicial } from "@/app/publicar/ScheduleInput";

type Categoria = {
  id: number;
  nombre: string;
  emoji: string;
};

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  categoria_id: number | null;
  tipo: "negocio" | "independiente";
  plan: "basico" | "premium";
  descripcion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  sitio_web: string | null;
  direccion: string | null;
  a_domicilio: boolean;
  zona_cobertura: string | null;
  disponibilidad: string | null;
  foto_portada: string | null;
  activo: boolean;
  verificado: boolean;
  premium_hasta: string | null;
};

const estadoInicial: UpdateState = { ok: false };

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function EditForm({
  negocio,
  categorias,
  horarios,
}: {
  negocio: Negocio;
  categorias: Categoria[];
  horarios: HorarioInicial[];
}) {
  const [state, formAction, pending] = useActionState(
    updateNegocio,
    estadoInicial,
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6 pb-8">
      <input type="hidden" name="id" value={negocio.id} />

      {state.ok && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm font-medium">
          Cambios guardados correctamente
        </div>
      )}
      {state.error && !state.ok && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm font-medium">
          {state.error}
        </div>
      )}

      {/* BASICO */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Basico
        </h2>
        <Field label="Nombre" error={fe.nombre}>
          <input
            name="nombre"
            defaultValue={negocio.nombre}
            required
            className="input-ue"
            maxLength={80}
          />
        </Field>
        <Field label="Categoria" error={fe.categoria_id}>
          <select
            name="categoria_id"
            defaultValue={negocio.categoria_id ?? ""}
            className="input-ue"
          >
            <option value="">Sin categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tipo">
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="tipo"
                value="negocio"
                defaultChecked={negocio.tipo === "negocio"}
                className="peer sr-only"
              />
              <span className="block text-center py-2 rounded-lg border border-border text-sm font-medium peer-checked:bg-foreground peer-checked:text-background peer-checked:border-foreground">
                Negocio
              </span>
            </label>
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="tipo"
                value="independiente"
                defaultChecked={negocio.tipo === "independiente"}
                className="peer sr-only"
              />
              <span className="block text-center py-2 rounded-lg border border-border text-sm font-medium peer-checked:bg-foreground peer-checked:text-background peer-checked:border-foreground">
                Independiente
              </span>
            </label>
          </div>
        </Field>
        <Field label="Descripcion" error={fe.descripcion}>
          <textarea
            name="descripcion"
            defaultValue={negocio.descripcion ?? ""}
            rows={3}
            maxLength={1000}
            className="input-ue resize-none"
          />
        </Field>
      </section>

      {/* CONTACTO */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Contacto
        </h2>
        <Field label="Telefono">
          <input
            name="telefono"
            defaultValue={negocio.telefono ?? ""}
            className="input-ue"
            inputMode="tel"
          />
        </Field>
        <Field label="WhatsApp">
          <input
            name="whatsapp"
            defaultValue={negocio.whatsapp ?? ""}
            className="input-ue"
            inputMode="tel"
            placeholder="569..."
          />
        </Field>
        <Field label="Email" error={fe.email}>
          <input
            name="email"
            type="email"
            defaultValue={negocio.email ?? ""}
            className="input-ue"
          />
        </Field>
        <Field label="Sitio web" error={fe.sitio_web}>
          <input
            name="sitio_web"
            type="url"
            defaultValue={negocio.sitio_web ?? ""}
            className="input-ue"
            placeholder="https://"
          />
        </Field>
      </section>

      {/* UBICACION */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Ubicacion y servicio
        </h2>
        <Field label="Direccion">
          <input
            name="direccion"
            defaultValue={negocio.direccion ?? ""}
            className="input-ue"
          />
        </Field>
        <label className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            name="a_domicilio"
            defaultChecked={negocio.a_domicilio}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">Hace delivery / a domicilio</span>
        </label>
        <Field label="Zona de cobertura">
          <input
            name="zona_cobertura"
            defaultValue={negocio.zona_cobertura ?? ""}
            className="input-ue"
            placeholder="Linares centro, Yerbas Buenas..."
          />
        </Field>
        <Field label="Nota de horario">
          <input
            name="disponibilidad"
            defaultValue={negocio.disponibilidad ?? ""}
            className="input-ue"
            maxLength={120}
            placeholder="Opcional - ej: Cerrado feriados"
          />
        </Field>
      </section>

      {/* HORARIOS */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Horarios
        </h2>
        <ScheduleInput initialHorarios={horarios} />
      </section>

      {/* MEDIA */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Media
        </h2>
        <Field label="Foto de portada (URL)" error={fe.foto_portada}>
          <input
            name="foto_portada"
            type="url"
            defaultValue={negocio.foto_portada ?? ""}
            className="input-ue"
            placeholder="https://..."
          />
        </Field>
        {negocio.foto_portada && (
          <div className="rounded-xl overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={negocio.foto_portada}
              alt="Portada actual"
              className="w-full h-32 object-cover"
            />
          </div>
        )}
      </section>

      {/* PLAN / ESTADO */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Plan y estado
        </h2>
        <Field label="Plan">
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="plan"
                value="basico"
                defaultChecked={negocio.plan === "basico"}
                className="peer sr-only"
              />
              <span className="block text-center py-2 rounded-lg border border-border text-sm font-medium peer-checked:bg-foreground peer-checked:text-background peer-checked:border-foreground">
                Basico
              </span>
            </label>
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="plan"
                value="premium"
                defaultChecked={negocio.plan === "premium"}
                className="peer sr-only"
              />
              <span className="block text-center py-2 rounded-lg border border-border text-sm font-medium peer-checked:bg-amber-500 peer-checked:text-white peer-checked:border-amber-500">
                Premium
              </span>
            </label>
          </div>
        </Field>
        <Field label="Premium hasta" error={fe.premium_hasta}>
          <input
            name="premium_hasta"
            type="date"
            defaultValue={toDateInput(negocio.premium_hasta)}
            className="input-ue"
          />
        </Field>
        <label className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={negocio.activo}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">Activo (visible en el sitio)</span>
        </label>
        <label className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            name="verificado"
            defaultChecked={negocio.verificado}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">Verificado (badge azul)</span>
        </label>
      </section>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-border -mx-4 px-4 py-3 flex gap-2">
        <Link
          href="/admin"
          className="flex-1 text-center py-3 rounded-full border border-border text-sm font-semibold hover:bg-secondary transition"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 py-3 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <style>{`
        .input-ue {
          width: 100%;
          border: 1px solid var(--color-border, #e5e5e5);
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.9rem;
          background: #fff;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-ue:focus {
          border-color: var(--color-foreground, #000);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
