"use client";

import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { publicarNegocio, type PublicarState } from "@/app/publicar/actions";

type Categoria = { id: number; nombre: string; emoji: string };

const CLAVE = "linaresya_popup_negocio";
const DEMORA_MS = 5000; // deja respirar la visita antes de interrumpir
const DIAS_ESPERA = 7; // si lo cierran, no vuelve a aparecer en 7 dias
// Cuanto se espera, como maximo, a que respondan el banner de cookies.
// Pasado ese rato el popup sale igual: la mayoria de la gente nunca toca el
// banner, y antes eso lo dejaba sin aparecer nunca.
const ESPERA_COOKIES_MS = 5000;

// Rutas donde el popup sobra o estorba: el formulario completo, el panel,
// la edicion del dueno, la ficha para imprimir QR y la pagina offline.
const RUTAS_EXCLUIDAS = ["/publicar", "/admin", "/dueno", "/qr", "/offline"];

const estadoInicial: PublicarState = { ok: false };

type Marca = { estado: "cerrado" | "enviado"; ts: number };

function leerMarca(): Marca | null {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Marca>;
    if (parsed.estado !== "cerrado" && parsed.estado !== "enviado") return null;
    return { estado: parsed.estado, ts: Number(parsed.ts) || 0 };
  } catch {
    // localStorage bloqueado o JSON viejo/corrupto: lo tratamos como sin marca.
    return null;
  }
}

function guardarMarca(estado: Marca["estado"]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ estado, ts: Date.now() }));
  } catch {
    /* sin almacenamiento: volvera a aparecer, no es grave */
  }
}

/**
 * Popup de captacion: al entrar al sitio invita a sumar el negocio y deja
 * enviarlo ahi mismo con lo minimo (nombre, categoria y WhatsApp).
 *
 * Reglas para que no sea molesto:
 *  - Aparece a los ~5s de la visita, nunca de golpe al cargar (para entonces
 *    el splash de la portada ya termino).
 *  - Una sola vez: si lo cierran vuelve recien en 7 dias; si envian el
 *    negocio, no vuelve nunca.
 *  - No aparece en /publicar, /admin, /dueno, /qr ni /offline.
 *  - Se cierra con Esc, tocando el fondo o con "Ahora no".
 *  - Espera a que respondan el banner de cookies, pero como maximo 5s.
 *  - ?popup=1 lo fuerza, para poder revisarlo sin limpiar el navegador.
 *
 * Usa el mismo server action que el formulario completo, asi que el negocio
 * entra igual que siempre: inactivo hasta que el admin lo revise.
 */
export default function PopupNegocio() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [state, formAction, isPending] = useActionState(
    publicarNegocio,
    estadoInicial,
  );

  const [nombre, setNombre] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [acepta, setAcepta] = useState(false);

  const [fallaronCategorias, setFallaronCategorias] = useState(false);

  const dialogoRef = useRef<HTMLDivElement>(null);
  const focoPrevio = useRef<HTMLElement | null>(null);

  const excluida = RUTAS_EXCLUIDAS.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const cerrar = useCallback(() => {
    setAbierto(false);
    // Si ya lo enviaron manda la marca "enviado" que grabo el efecto de exito.
    if (!state.ok) guardarMarca("cerrado");
    focoPrevio.current?.focus();
  }, [state.ok]);

  // ── Cuando corresponde abrirlo ──────────────────────────────────
  useEffect(() => {
    if (excluida) return;

    // ?popup=1 lo fuerza al toque, ignorando marcas y esperas. Sirve para
    // revisarlo sin tener que limpiar el navegador.
    const forzado = new URLSearchParams(window.location.search).get("popup") === "1";

    if (!forzado) {
      const marca = leerMarca();
      if (marca?.estado === "enviado") return;
      if (
        marca?.estado === "cerrado" &&
        Date.now() - marca.ts < DIAS_ESPERA * 24 * 60 * 60 * 1000
      ) {
        return;
      }
    }

    const abrir = () => {
      focoPrevio.current = document.activeElement as HTMLElement | null;
      setAbierto(true);
    };

    const alVolver = () => {
      if (document.visibilityState === "visible") abrir();
    };

    // Mejor no tapar el banner de cookies mientras lo estan respondiendo,
    // pero solo por un rato: si no lo tocan, el popup sale igual.
    const cookiesRespondidas = () => {
      try {
        return localStorage.getItem("cookie-consent") !== null;
      } catch {
        return true;
      }
    };

    let reintento: ReturnType<typeof setInterval> | undefined;

    const intentar = (ultimaChance: boolean) => {
      // Si la pestana esta en segundo plano esperamos a que vuelvan: abrirlo
      // a ciegas gastaria la unica oportunidad que tenemos.
      if (document.visibilityState !== "visible") {
        document.addEventListener("visibilitychange", alVolver, { once: true });
        return true;
      }
      if (!ultimaChance && !cookiesRespondidas()) return false;
      abrir();
      return true;
    };

    const timer = setTimeout(() => {
      if (forzado) {
        abrir();
        return;
      }
      if (intentar(false)) return;

      const limite = Date.now() + ESPERA_COOKIES_MS;
      reintento = setInterval(() => {
        if (intentar(Date.now() >= limite) && reintento) clearInterval(reintento);
      }, 1000);
    }, forzado ? 0 : DEMORA_MS);

    return () => {
      clearTimeout(timer);
      if (reintento) clearInterval(reintento);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [excluida]);

  // ── Categorias: se piden recien al abrir ────────────────────────
  useEffect(() => {
    if (!abierto || categorias.length > 0) return;
    let cancelado = false;

    fetch("/api/categorias")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("http"))))
      .then((json: { categorias?: Categoria[] }) => {
        if (cancelado) return;
        const lista = json.categorias ?? [];
        setCategorias(lista);
        setFallaronCategorias(lista.length === 0);
      })
      .catch(() => {
        // Sin categorias no se puede enviar desde aca: mandamos al formulario.
        if (!cancelado) setFallaronCategorias(true);
      });

    return () => {
      cancelado = true;
    };
  }, [abierto, categorias.length]);

  // ── Esc, bloqueo de scroll y foco inicial ───────────────────────
  useEffect(() => {
    if (!abierto) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cerrar();
        return;
      }
      if (e.key !== "Tab") return;

      // Trampa de foco: el tabulador no debe salirse del modal.
      const foco = dialogoRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!foco || foco.length === 0) return;
      const primero = foco[0];
      const ultimo = foco[foco.length - 1];
      const activo = document.activeElement;

      if (e.shiftKey && (activo === primero || activo === dialogoRef.current)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Enfocamos el contenedor, no el input: en el celular abrir el teclado de
    // golpe tapa el modal entero.
    dialogoRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, cerrar]);

  // Enviado: que no vuelva a aparecer en este navegador.
  useEffect(() => {
    if (state.ok) guardarMarca("enviado");
  }, [state.ok]);

  if (!abierto) return null;

  const puedeEnviar =
    nombre.trim().length >= 3 && categoriaId !== "" && acepta && !isPending;

  return (
    <div
      className="fixed inset-0 flex items-end justify-center p-3 sm:items-center sm:p-6"
      style={{ zIndex: 150 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-negocio-titulo"
    >
      {/* Fondo: cerrar tocando afuera */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={cerrar}
        className="absolute inset-0 h-full w-full cursor-default bg-[#1A1410]/60 backdrop-blur-[2px]"
      />

      <div
        ref={dialogoRef}
        tabIndex={-1}
        // El contenedor se enfoca solo para anclar la trampa de foco: no es
        // navegable con Tab, asi que no le corresponde el anillo global de
        // :focus-visible (que ademas pisa la sombra de la tarjeta).
        style={{ outline: "none", boxShadow: "0 18px 60px rgba(0,0,0,0.28)" }}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white"
      >
        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#1A1410] transition hover:bg-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {state.ok ? (
          <div className="px-6 py-10 text-center">
            <div className="text-5xl">{"\u{2705}"}</div>
            <h2
              id="popup-negocio-titulo"
              className="mt-3 text-2xl font-extrabold tracking-tight text-[#1A1410]"
            >
              ¡Listo! Solicitud enviada
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6B5E57]">
              Revisamos tu negocio y lo activamos en las próximas horas. Después
              te mandamos un link para completar fotos y horarios cuando quieras.
            </p>
            <button
              type="button"
              onClick={cerrar}
              className="mt-6 w-full rounded-full bg-[#1A1410] px-6 py-3.5 text-base font-bold text-white transition hover:bg-[#2B6E80]"
            >
              Seguir explorando
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[#2B6E80] to-[#1f5268] px-6 pb-6 pt-7 text-white">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">
                📍 Directorio local de Linares
              </p>
              <h2
                id="popup-negocio-titulo"
                className="mt-2 text-2xl font-black leading-tight tracking-tight"
              >
                ¿Tienes un negocio en Linares?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Súmalo <strong className="text-white">gratis</strong> en 30
                segundos y aparece frente a los vecinos que te buscan.
              </p>
            </div>

            <form action={formAction} className="px-6 pb-6 pt-5">
              {/* De donde vino el alta, para poder medir si el popup sirve */}
              <input type="hidden" name="origen" value="popup" />
              {state.error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {state.error}
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label
                    htmlFor="popup-nombre"
                    className="mb-1.5 block text-sm font-bold text-[#1A1410]"
                  >
                    ¿Cómo se llama tu negocio?
                    <span className="ml-0.5 text-[#C05A46]">*</span>
                  </label>
                  <input
                    id="popup-nombre"
                    name="nombre"
                    type="text"
                    required
                    minLength={3}
                    maxLength={80}
                    placeholder="Ej: Pizzería Don Vittorio"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8E4DE] bg-[#F9F8F6] px-4 py-3 text-base text-[#1A1410] outline-none transition placeholder:text-[#A99F97] focus:border-[#2B6E80] focus:bg-white"
                  />
                  {state.fieldErrors?.nombre && (
                    <p className="mt-1 text-[11px] font-medium text-red-600">
                      {state.fieldErrors.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="popup-categoria"
                    className="mb-1.5 block text-sm font-bold text-[#1A1410]"
                  >
                    ¿A qué se dedica?
                    <span className="ml-0.5 text-[#C05A46]">*</span>
                  </label>
                  <select
                    id="popup-categoria"
                    name="categoria_id"
                    required
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    disabled={categorias.length === 0}
                    className="w-full rounded-2xl border border-[#E8E4DE] bg-[#F9F8F6] px-4 py-3 text-base text-[#1A1410] outline-none transition focus:border-[#2B6E80] focus:bg-white disabled:opacity-60"
                  >
                    <option value="">
                      {categorias.length > 0
                        ? "Selecciona una categoría"
                        : fallaronCategorias
                          ? "No pudimos cargar las categorías"
                          : "Cargando categorías…"}
                    </option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.nombre}
                      </option>
                    ))}
                  </select>
                  {state.fieldErrors?.categoria_id && (
                    <p className="mt-1 text-[11px] font-medium text-red-600">
                      {state.fieldErrors.categoria_id}
                    </p>
                  )}
                  {fallaronCategorias && (
                    <p className="mt-1 text-[11px] text-[#8E8279]">
                      Sigue desde el{" "}
                      <Link
                        href="/publicar"
                        onClick={cerrar}
                        className="font-semibold text-[#2B6E80] underline"
                      >
                        formulario completo
                      </Link>
                      .
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="popup-whatsapp"
                    className="mb-1.5 block text-sm font-bold text-[#1A1410]"
                  >
                    ¿Tu WhatsApp?
                  </label>
                  <input
                    id="popup-whatsapp"
                    name="whatsapp"
                    type="tel"
                    placeholder="9 1234 5678"
                    className="w-full rounded-2xl border border-[#E8E4DE] bg-[#F9F8F6] px-4 py-3 text-base text-[#1A1410] outline-none transition placeholder:text-[#A99F97] focus:border-[#2B6E80] focus:bg-white"
                  />
                  <p className="mt-1 text-[11px] text-[#8E8279]">
                    Es el botón que más usan los clientes
                  </p>
                </div>
              </div>

              {/* Turnstile: el script de Cloudflare renderiza el widget al
                  cargar, por eso el div se monta junto con el script. */}
              {turnstileSiteKey && (
                <>
                  <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                    strategy="afterInteractive"
                    async
                    defer
                  />
                  <div
                    className="cf-turnstile mt-4 flex justify-center"
                    data-sitekey={turnstileSiteKey}
                    data-theme="light"
                  />
                </>
              )}

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E8E4DE] bg-[#F9F8F6] px-4 py-3">
                <input
                  type="checkbox"
                  name="acepta_privacidad"
                  required
                  checked={acepta}
                  onChange={(e) => setAcepta(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#1A1410]"
                />
                <span className="text-xs leading-relaxed text-[#6B5E57]">
                  Acepto la{" "}
                  <Link
                    href="/privacidad"
                    target="_blank"
                    className="font-semibold text-[#2B6E80] underline"
                  >
                    Política de Privacidad
                  </Link>
                  . Entiendo que los datos del negocio se publicarán en su ficha
                  para que los vecinos puedan contactarme.
                </span>
              </label>

              <button
                type="submit"
                disabled={!puedeEnviar}
                className="mt-4 w-full rounded-full bg-[#1A1410] px-6 py-4 text-base font-bold text-white transition hover:bg-[#2B6E80] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#1A1410]"
              >
                {isPending ? "Enviando…" : "Publicar mi negocio gratis"}
              </button>

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={cerrar}
                  className="text-[13px] font-semibold text-[#8E8279] transition hover:text-[#1A1410]"
                >
                  Ahora no
                </button>
                <Link
                  href="/publicar"
                  onClick={cerrar}
                  className="text-[13px] font-semibold text-[#2B6E80] hover:underline"
                >
                  Formulario completo →
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
