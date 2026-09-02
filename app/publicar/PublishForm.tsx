"use client";

import Script from "next/script";
import Link from "next/link";
import LinkDueno from "@/components/LinkDueno";
import { useActionState, useCallback, useState } from "react";
import { publicarNegocio, type PublicarState } from "./actions";
import ScheduleFields from "./ScheduleFields";
import PhotoUpload from "./PhotoUpload";

type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  emoji: string;
};

const estadoInicial: PublicarState = { ok: false };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{7,15}$/;
// Acepta "minegocio.cl" igual que el server action, que le antepone https://
const URL_RE = /^(https?:\/\/)?[^\s./]+\.[^\s/]{2,}(\/.*)?$/;

type CoreKey = "nombre" | "categoria_id" | "whatsapp" | "direccion";

const CORE: {
  key: CoreKey;
  label: string;
  required: boolean;
  placeholder: string;
  hint?: string;
  tipo?: "text" | "tel";
  isSelect?: boolean;
}[] = [
  {
    key: "nombre",
    label: "¿Cómo se llama tu negocio?",
    required: true,
    placeholder: "Ej: Pizzería Don Vittorio",
    tipo: "text",
  },
  {
    key: "categoria_id",
    label: "¿A qué se dedica?",
    required: true,
    placeholder: "",
    isSelect: true,
  },
  {
    key: "whatsapp",
    label: "¿Tu WhatsApp?",
    required: false,
    placeholder: "9 1234 5678",
    hint: "Es el botón que más usan los clientes",
    tipo: "tel",
  },
  {
    key: "direccion",
    label: "¿Dónde te ubican?",
    required: false,
    placeholder: "Ej: Independencia 123, Linares",
    hint: "Si trabajas solo a domicilio, déjala vacía",
    tipo: "text",
  },
];

function lleno(key: CoreKey, valor: string): boolean {
  if (key === "nombre") return valor.trim().length >= 3;
  return valor.trim().length > 0;
}

/**
 * Formulario de publicacion — revelado progresivo.
 *
 * Solo se ve un campo core a la vez: el siguiente aparece cuando el actual
 * es valido (o el usuario lo omite, si es opcional). Con nombre + categoria
 * listos se habilita el bloque plegable "Agregar mas detalles".
 *
 * IMPORTANTE: el bloque de detalles se oculta con CSS, no se desmonta. Sus
 * campos (sobre todo los horarios y las URLs de fotos ya subidas) tienen que
 * seguir en el DOM para que viajen en el FormData aunque este cerrado.
 */
export default function PublishForm({
  categorias,
  esAdmin = false,
  origen = "formulario",
}: {
  categorias: Categoria[];
  esAdmin?: boolean;
  /** De donde llego el alta. "popup" cuando vino del aviso de la portada. */
  origen?: "popup" | "formulario";
}) {
  const [state, formAction, isPending] = useActionState(
    publicarNegocio,
    estadoInicial,
  );
  const turnstileSiteKey = esAdmin
    ? undefined
    : process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const [values, setValues] = useState({
    nombre: "",
    categoria_id: "",
    whatsapp: "",
    direccion: "",
    email: "",
    telefono: "",
    sitio_web: "",
    a_domicilio: false,
    acepta_privacidad: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [omitidos, setOmitidos] = useState<Record<string, boolean>>({});
  const [detallesAbiertos, setDetallesAbiertos] = useState(false);
  const [horarioOk, setHorarioOk] = useState(true);

  const set = (key: string, valor: string | boolean) =>
    setValues((v) => ({ ...v, [key]: valor }));
  const tocar = (key: string) => setTouched((t) => ({ ...t, [key]: true }));

  // setState es estable: ScheduleFields lo llama dentro de un effect.
  const onHorarioValid = useCallback((ok: boolean) => setHorarioOk(ok), []);

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
            : "Revisamos tu negocio y lo activamos en las próximas horas. Mientras tanto, ya podés completar fotos y horarios vos mismo."}
        </p>

        {state.editarUrl && <LinkDueno url={state.editarUrl} />}
        <a
          href={esAdmin ? "/admin" : "/"}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-[#1A1410] text-white text-sm font-bold px-6 py-3"
        >
          {esAdmin ? "Volver al admin" : "Volver al inicio"}
        </a>
        {esAdmin && (
          <Link
            href="/admin/negocio/nuevo"
            className="mt-3 block text-sm font-semibold text-[#2B6E80]"
          >
            + Agregar otro negocio
          </Link>
        )}
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  // ── Errores en vivo (solo despues de onBlur) ─────────────────────
  const errores: Record<string, string> = {};
  if (touched.nombre && !lleno("nombre", values.nombre))
    errores.nombre = "Ingresa al menos 3 caracteres.";
  if (touched.categoria_id && !values.categoria_id)
    errores.categoria_id = "Elige una categoría.";
  if (touched.whatsapp && values.whatsapp && !PHONE_RE.test(values.whatsapp))
    errores.whatsapp = "Ese WhatsApp no parece válido.";
  if (touched.telefono && values.telefono && !PHONE_RE.test(values.telefono))
    errores.telefono = "Ese teléfono no parece válido.";
  if (touched.email && values.email && !EMAIL_RE.test(values.email))
    errores.email = "Ese email no parece válido.";
  if (touched.sitio_web && values.sitio_web && !URL_RE.test(values.sitio_web))
    errores.sitio_web = "Usa una dirección válida, ej: tu-negocio.cl";

  const err = (key: string) => errores[key] || fe[key] || "";

  // ── Revelado progresivo ──────────────────────────────────────────
  let visibles = 1;
  for (let i = 0; i < CORE.length; i++) {
    const c = CORE[i];
    const ok = c.required
      ? lleno(c.key, values[c.key])
      : lleno(c.key, values[c.key]) || omitidos[c.key];
    if (ok) visibles = i + 2;
    else break;
  }
  visibles = Math.min(visibles, CORE.length);

  const coreListo =
    lleno("nombre", values.nombre) && lleno("categoria_id", values.categoria_id);

  const hayErrores = Object.keys(errores).length > 0;
  const puedeEnviar =
    coreListo &&
    horarioOk &&
    !hayErrores &&
    (esAdmin || values.acepta_privacidad) &&
    !isPending;

  return (
    <form action={formAction} className="px-4 pb-10 pt-2">
      {/* De donde vino el alta, para poder medir si el popup sirve */}
      <input type="hidden" name="origen" value={origen} />
      {state.error && (
        <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      {/* ── Lo esencial: un campo a la vez ─────────────────────── */}
      <div className="rounded-3xl bg-white border border-[#F0EDE8] shadow-[0_2px_14px_rgba(0,0,0,0.06)] p-5">
        {/* Progreso */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-1.5 rounded-full bg-[#F0EDE8] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#2B6E80] transition-[width] duration-500 ease-out"
              style={{ width: `${(visibles / CORE.length) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2B6E80] shrink-0">
            Paso {visibles} de {CORE.length}
          </span>
        </div>

        <div className="space-y-4">
          {CORE.slice(0, visibles).map((c) => (
            <div key={c.key} className="paso-ue">
              <label
                className="block text-sm font-bold text-[#1A1410] mb-1.5"
                htmlFor={`f-${c.key}`}
              >
                {c.label}
                {c.required && <span className="text-[#C05A46] ml-0.5">*</span>}
              </label>

              {c.isSelect ? (
                <select
                  id={`f-${c.key}`}
                  name="categoria_id"
                  required
                  className="input-ue"
                  value={values.categoria_id}
                  onChange={(e) => set("categoria_id", e.target.value)}
                  onBlur={() => tocar("categoria_id")}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`f-${c.key}`}
                  type={c.tipo}
                  name={c.key}
                  required={c.required}
                  minLength={c.key === "nombre" ? 3 : undefined}
                  maxLength={c.key === "nombre" ? 80 : undefined}
                  placeholder={c.placeholder}
                  className="input-ue"
                  value={values[c.key]}
                  onChange={(e) => set(c.key, e.target.value)}
                  onBlur={() => tocar(c.key)}
                />
              )}

              {err(c.key) ? (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {err(c.key)}
                </p>
              ) : (
                c.hint && (
                  <p className="mt-1 text-[11px] text-[#8E8279]">{c.hint}</p>
                )
              )}

              {!c.required && !lleno(c.key, values[c.key]) && !omitidos[c.key] && (
                <button
                  type="button"
                  onClick={() => setOmitidos((o) => ({ ...o, [c.key]: true }))}
                  className="mt-2 text-[12px] font-semibold text-[#8E8279] hover:text-[#2B6E80] transition"
                >
                  Omitir por ahora →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Detalles opcionales ─────────────────────────────────── */}
      {/* Se monta apenas nombre+categoria estan listos y NUNCA se desmonta:
          si el usuario lo cierra, los campos siguen viajando en el FormData. */}
      {coreListo && (
        <div className="paso-ue mt-4 rounded-3xl bg-white border border-[#F0EDE8] shadow-[0_2px_14px_rgba(0,0,0,0.06)] overflow-hidden">
          <button
            type="button"
            onClick={() => setDetallesAbiertos((v) => !v)}
            aria-expanded={detallesAbiertos}
            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#F9F8F6] transition"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2B6E80]/8 text-lg">
              ✨
            </span>
            <span className="flex-1">
              <span className="block text-sm font-bold text-[#1A1410]">
                Agregar más detalles
              </span>
              <span className="block text-[11px] text-[#8E8279]">
                Fotos, horarios, descripción — opcional, también puedes hacerlo
                después
              </span>
            </span>
            <svg
              className={`h-4 w-4 shrink-0 text-[#8E8279] transition-transform duration-200 ${
                detallesAbiertos ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <div style={{ display: detallesAbiertos ? "block" : "none" }}>
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

              <Field label="Horarios">
                <ScheduleFields onValidChange={onHorarioValid} />
              </Field>

              <Field label="Teléfono" error={err("telefono")}>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="+56 9 1234 5678"
                  className="input-ue"
                  value={values.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  onBlur={() => tocar("telefono")}
                />
              </Field>

              <Field
                label="Email"
                hint="Te avisamos por acá cuando aprobemos tu negocio"
                error={err("email")}
              >
                <input
                  type="email"
                  name="email"
                  maxLength={120}
                  placeholder="tu@email.com"
                  className="input-ue"
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={() => tocar("email")}
                />
              </Field>

              <Field label="Tipo">
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 rounded-2xl border border-[#E8E4DE] bg-[#F9F8F6] px-4 py-3 cursor-pointer has-[:checked]:border-[#1A1410] has-[:checked]:bg-white">
                    <input
                      type="radio"
                      name="tipo"
                      value="negocio"
                      defaultChecked
                      className="accent-[#1A1410]"
                    />
                    <span className="text-sm font-medium text-[#1A1410]">
                      Negocio / Local
                    </span>
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-[#E8E4DE] bg-[#F9F8F6] px-4 py-3 cursor-pointer has-[:checked]:border-[#1A1410] has-[:checked]:bg-white">
                    <input
                      type="radio"
                      name="tipo"
                      value="independiente"
                      className="accent-[#1A1410]"
                    />
                    <span className="text-sm font-medium text-[#1A1410]">
                      Independiente
                    </span>
                  </label>
                </div>
              </Field>

              <label className="flex items-center gap-3 rounded-2xl bg-[#F9F8F6] border border-[#E8E4DE] px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="a_domicilio"
                  checked={values.a_domicilio}
                  onChange={(e) => set("a_domicilio", e.target.checked)}
                  className="h-4 w-4 accent-[#1A1410]"
                />
                <span className="text-sm font-medium text-[#1A1410]">
                  Atiendo a domicilio
                </span>
              </label>

              {/* Solo tiene sentido si va a domicilio */}
              {values.a_domicilio && (
                <div className="paso-ue">
                  <Field
                    label="Zona de cobertura"
                    hint="Qué sectores cubres"
                  >
                    <input
                      type="text"
                      name="zona_cobertura"
                      placeholder="Ej: Todo Linares urbano"
                      className="input-ue"
                    />
                  </Field>
                </div>
              )}

              <Field label="Sitio web" error={err("sitio_web")}>
                <input
                  type="text"
                  inputMode="url"
                  name="sitio_web"
                  maxLength={200}
                  placeholder="https://tu-negocio.cl"
                  className="input-ue"
                  value={values.sitio_web}
                  onChange={(e) => set("sitio_web", e.target.value)}
                  onBlur={() => tocar("sitio_web")}
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
          </div>
        </div>
      )}

      {/* Turnstile: siempre montado. El script de Cloudflare renderiza el
          widget al cargar, asi que el div no puede aparecer despues. */}
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

      {/* ── Consentimiento + submit ─────────────────────────────── */}
      {coreListo && (
        <div className="paso-ue">
          {!esAdmin && (
            <label className="mt-4 flex items-start gap-3 rounded-2xl bg-white border border-[#E8E4DE] px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                name="acepta_privacidad"
                required
                checked={values.acepta_privacidad}
                onChange={(e) => set("acepta_privacidad", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#1A1410] shrink-0"
              />
              <span className="text-xs text-[#6B5E57] leading-relaxed">
                He leído y acepto la{" "}
                <a
                  href="/privacidad"
                  target="_blank"
                  className="font-semibold text-[#2B6E80] underline"
                >
                  Política de Privacidad
                </a>
                . Entiendo que los datos del negocio se publicarán en la ficha
                para que los vecinos puedan contactarme, y que puedo pedir su
                modificación o eliminación cuando quiera.
              </span>
            </label>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={!puedeEnviar}
              className="w-full rounded-full bg-[#1A1410] text-white text-base font-bold px-6 py-4 transition hover:bg-[#2B6E80] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1A1410]"
            >
              {isPending
                ? "Enviando…"
                : esAdmin
                  ? "Crear negocio activo"
                  : "Publicar mi negocio gratis"}
            </button>
            <p className="mt-3 text-[11px] text-[#8E8279] text-center">
              {esAdmin
                ? "El negocio quedará activo y visible de inmediato."
                : "Gratis y sin compromiso. Lo revisamos y activamos en pocas horas."}
            </p>
          </div>
        </div>
      )}

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
      {hint && !error && <p className="mt-1 text-[11px] text-[#8E8279]">{hint}</p>}
      {error && (
        <p className="mt-1 text-[11px] text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
