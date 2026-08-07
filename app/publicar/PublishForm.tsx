"use client";

import Script from "next/script";
import { useActionState } from "react";
import { publicarNegocio, type PublicarState } from "./actions";
import ScheduleInput from "./ScheduleInput";
import PhotoUpload from "./PhotoUpload";

type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  emoji: string;
};

const estadoInicial: PublicarState = { ok: false };

/**
 * Formulario de publicacion.
 *
 * Diseño pensado para conversion: solo 4 campos esenciales a la vista.
 * Todo lo demas (fotos, horarios, descripcion, etc.) queda plegado en
 * "Agregar mas detalles" y ademas se puede completar despues desde el
 * link de edicion que recibe el dueño. Los campos opcionales siguen en
 * el DOM aunque el bloque este cerrado, asi que se envian igual.
 */
export default function PublishForm({ categorias, esAdmin = false }: { categorias: Categoria[]; esAdmin?: boolean }) {
  const [state, formAction, isPending] = useActionState(publicarNegocio, estadoInicial);
  const turnstileSiteKey = esAdmin ? undefined : process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (state.ok) {
    return (
      <div className="mx-4 mt-6 rounded-3xl bg-white border border-[#F0EDE8] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 text-center">
        <div className="text-5xl mb-3">{"\u{2705}"}</div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#1A1410]">
          {esAdmin ? "Negocio creado" : "¡Listo! Solicitud enviada"}
        </h2>
        <p className="mt-2 text-sm text-[#6B5E57]">
          {esAdmin
            ? "El negocio quedó activo y ya aparece en el sitio."
            : "Revisamos tu negocio y lo activamos en las próximas horas. Después te mandamos un link para que completes fotos y horarios cuando quieras."}
        </p>
        <a
          href={esAdmin ? "/admin" : "/"}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-[#1A1410] text-white text-sm font-bold px-6 py-3"
        >
          {esAdmin ? "Volver al admin" : "Volver al inicio"}
        </a>
        {esAdmin && (
          <a
            href="/admin/negocio/nuevo"
            className="mt-3 block text-sm font-semibold text-[#2B6E80]"
          >
            + Agregar otro negocio
          </a>
        )}
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="px-4 pb-10 pt-2">
      {state.error && (
        <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      {/* ── Lo esencial: 4 campos ─────────────────────────────── */}
      <div className="rounded-3xl bg-white border border-[#F0EDE8] shadow-[0_2px_14px_rgba(0,0,0,0.06)] p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2B6E80]">
          Datos básicos · toma 1 minuto
        </p>

        <Field label="Nombre del negocio" required error={fe.nombre}>
          <input
            type="text"
            name="nombre"
            required
            minLength={3}
            maxLength={80}
            placeholder="Ej: Pizzería Don Vittorio"
            className="input-ue"
          />
        </Field>

        <Field label="Categoría" required error={fe.categoria_id}>
          <select name="categoria_id" required className="input-ue">
            <option value="">Selecciona una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.nombre}
              </option>
            ))}
          </select>
        </Field>

        <Field label="WhatsApp" hint="Es el botón que más usan los clientes">
          <input
            type="tel"
            name="whatsapp"
            placeholder="9 1234 5678"
            className="input-ue"
          />
        </Field>

        <Field label="Dirección" hint="Si trabajas solo a domicilio, déjala vacía">
          <input
            type="text"
            name="direccion"
            placeholder="Ej: Independencia 123, Linares"
            className="input-ue"
          />
        </Field>
      </div>

      {/* ── Todo lo demás, plegado ────────────────────────────── */}
      <details className="group mt-4 rounded-3xl bg-white border border-[#F0EDE8] shadow-[0_2px_14px_rgba(0,0,0,0.06)] overflow-hidden">
        <summary className="flex cursor-pointer items-center gap-3 px-5 py-4 list-none hover:bg-[#F9F8F6] transition">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2B6E80]/8 text-lg">✨</span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-[#1A1410]">Agregar más detalles</span>
            <span className="block text-[11px] text-[#8E8279]">
              Fotos, horarios, descripción — opcional, también puedes hacerlo después
            </span>
          </span>
          <svg
            className="h-4 w-4 shrink-0 text-[#8E8279] transition-transform group-open:rotate-180"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>

        <div className="border-t border-[#F0EDE8] px-5 py-5 space-y-4">
          <Field label="Descripción corta" hint="Máximo 500 caracteres" error={fe.descripcion}>
            <textarea
              name="descripcion"
              rows={3}
              maxLength={500}
              placeholder="Qué ofreces, tu estilo, lo que te distingue…"
              className="input-ue resize-none"
            />
          </Field>

          <Field label="Foto de portada" hint="Se ve grande en tu ficha y en las tarjetas">
            <PhotoUpload
              name="foto_portada"
              label=""
              hint="Si no subes una, se muestra el emoji de la categoría"
            />
          </Field>

          <Field label="Horarios" hint="Marca los días que atiendes">
            <ScheduleInput />
          </Field>

          <Field label="Teléfono">
            <input
              type="tel"
              name="telefono"
              placeholder="+56 9 1234 5678"
              className="input-ue"
            />
          </Field>

          <Field label="Email" hint="Te avisamos por acá cuando aprobemos tu negocio" error={fe.email}>
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              maxLength={120}
              className="input-ue"
            />
          </Field>

          <Field label="Tipo">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-2xl border border-[#E8E4DE] bg-[#F9F8F6] px-4 py-3 cursor-pointer has-[:checked]:border-[#1A1410] has-[:checked]:bg-white">
                <input type="radio" name="tipo" value="negocio" defaultChecked className="accent-[#1A1410]" />
                <span className="text-sm font-medium text-[#1A1410]">Negocio / Local</span>
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-[#E8E4DE] bg-[#F9F8F6] px-4 py-3 cursor-pointer has-[:checked]:border-[#1A1410] has-[:checked]:bg-white">
                <input type="radio" name="tipo" value="independiente" className="accent-[#1A1410]" />
                <span className="text-sm font-medium text-[#1A1410]">Independiente</span>
              </label>
            </div>
          </Field>

          <label className="flex items-center gap-3 rounded-2xl bg-[#F9F8F6] border border-[#E8E4DE] px-4 py-3 cursor-pointer">
            <input type="checkbox" name="a_domicilio" className="h-4 w-4 accent-[#1A1410]" />
            <span className="text-sm font-medium text-[#1A1410]">Atiendo a domicilio</span>
          </label>

          <Field label="Zona de cobertura" hint="Si vas a domicilio: qué sectores cubres">
            <input
              type="text"
              name="zona_cobertura"
              placeholder="Ej: Todo Linares urbano"
              className="input-ue"
            />
          </Field>

          <Field label="Sitio web" error={fe.sitio_web}>
            <input
              type="url"
              name="sitio_web"
              placeholder="https://tu-negocio.cl"
              maxLength={200}
              className="input-ue"
            />
          </Field>

          <Field label="Nota de horario" hint="Ej: 'Solo con cita previa'">
            <input
              type="text"
              name="disponibilidad"
              placeholder="Ej: Cerrado feriados"
              maxLength={120}
              className="input-ue"
            />
          </Field>

          <Field label="Más fotos" hint="Galería — hasta 4 más">
            <div className="grid grid-cols-2 gap-3">
              <PhotoUpload name="foto_galeria_1" label="" />
              <PhotoUpload name="foto_galeria_2" label="" />
              <PhotoUpload name="foto_galeria_3" label="" />
              <PhotoUpload name="foto_galeria_4" label="" />
            </div>
          </Field>
        </div>
      </details>

      {turnstileSiteKey && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="afterInteractive"
            async
            defer
          />
          <div
            className="cf-turnstile flex justify-center mt-4"
            data-sitekey={turnstileSiteKey}
            data-theme="light"
          />
        </>
      )}

      {/* Consentimiento de datos personales (Ley 21.719) — solo público */}
      {!esAdmin && (
        <label className="mt-4 flex items-start gap-3 rounded-2xl bg-white border border-[#E8E4DE] px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            name="acepta_privacidad"
            required
            className="mt-0.5 h-4 w-4 accent-[#1A1410] shrink-0"
          />
          <span className="text-xs text-[#6B5E57] leading-relaxed">
            He leído y acepto la{" "}
            <a href="/privacidad" target="_blank" className="font-semibold text-[#2B6E80] underline">
              Política de Privacidad
            </a>
            . Entiendo que los datos del negocio se publicarán en la ficha para que
            los vecinos puedan contactarme, y que puedo pedir su modificación o
            eliminación cuando quiera.
          </span>
        </label>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-[#1A1410] text-white text-base font-bold px-6 py-4 transition hover:bg-[#2B6E80] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? "Enviando…" : esAdmin ? "Crear negocio activo" : "Publicar mi negocio gratis"}
        </button>
        <p className="mt-3 text-[11px] text-[#8E8279] text-center">
          {esAdmin
            ? "El negocio quedará activo y visible de inmediato."
            : "Gratis y sin compromiso. Lo revisamos y activamos en pocas horas."}
        </p>
      </div>

      <style>{`
        .input-ue {
          width: 100%;
          background: #F9F8F6;
          color: #1A1410;
          border-radius: 1rem;
          padding: 0.875rem 1rem;
          font-size: 0.9375rem;
          outline: none;
          border: 1px solid #E8E4DE;
          transition: border-color 0.15s, background 0.15s;
        }
        .input-ue:focus {
          border-color: #2B6E80;
          background: #fff;
        }
        .input-ue::placeholder { color: #A39A93; }
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
        <label className="block text-sm font-bold text-[#1A1410] mb-1.5">
          {label}
          {required && <span className="text-[#C05A46] ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="mt-1 text-[11px] text-[#8E8279]">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-[11px] text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
