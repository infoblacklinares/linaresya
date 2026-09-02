"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LEON } from "@/lib/leon-paths";

const CLAVE = "linaresya_popup_negocio";
const DEMORA_MS = 5000; // deja respirar la visita antes de interrumpir
const DIAS_ESPERA = 7; // si lo cierran, no vuelve a aparecer en 7 dias
// Cuanto se espera, como maximo, a que respondan el banner de cookies.
const ESPERA_COOKIES_MS = 5000;

// Rutas donde el popup sobra o estorba: el formulario al que lleva, el panel,
// la edicion del dueno, la ficha para imprimir QR y la pagina offline.
const RUTAS_EXCLUIDAS = ["/publicar", "/admin", "/dueno", "/qr", "/offline"];

// Clave que deja el splash del leon al terminar. Con ?popup=1 el popup abre
// de inmediato y quedaria tapado por el splash, asi que en ese caso se espera
// a que termine. En el camino normal no hace falta: a los 5s ya paso.
const CLAVE_SPLASH = "linaresya_splash_leon_visto";
const ESPERA_SPLASH_MS = 4000;

// El alta se sigue atribuyendo al popup: el boton lleva el origen en la URL y
// /publicar lo mete en el formulario.
const DESTINO = "/publicar?origen=popup";

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
 * Marca un evento del embudo: cuantos lo ven, cuantos lo cierran y cuantos
 * van al formulario. La ultima etapa (cuantos terminan publicando) sale de la
 * columna `origen` de negocios, no de aca.
 *
 * No espera respuesta ni rompe nada si falla: es una metrica, no parte del
 * flujo. sendBeacon sobrevive a la navegacion a /publicar.
 */
function medir(evento: "popup_visto" | "popup_cerrado" | "popup_click") {
  try {
    const cuerpo = JSON.stringify({ evento });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([cuerpo], { type: "text/plain" }));
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      body: cuerpo,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  } catch {
    /* sin red o sin permisos: la metrica se pierde, el popup sigue igual */
  }
}

/**
 * Invitacion a sumar el negocio. No pide datos: muestra al leon, dice para
 * que sirve y lleva al formulario de /publicar.
 *
 * Antes traia el formulario adentro. Pedir nombre, categoria, WhatsApp y
 * consentimiento en una ventana que aparece sola es mucho pedir de golpe: la
 * ventana interrumpe, el formulario es el compromiso, y juntarlos hace que se
 * cierre sin leer. Asi la ventana solo propone, y el compromiso vive en su
 * propia pagina, donde el que llega ya decidio entrar.
 *
 * Reglas para que no moleste:
 *  - Aparece a los ~5s de la visita, nunca de golpe al cargar.
 *  - Espera a que respondan el banner de cookies, pero como maximo 5s.
 *  - Una sola vez: si lo cierran vuelve recien en 7 dias.
 *  - No aparece en /publicar, /admin, /dueno, /qr ni /offline.
 *  - Se cierra con Esc, tocando el fondo o con "Ahora no".
 *  - ?popup=1 lo fuerza, para poder revisarlo sin limpiar el navegador.
 */
export default function PopupNegocio() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  const dialogoRef = useRef<HTMLDivElement>(null);
  const focoPrevio = useRef<HTMLElement | null>(null);

  const excluida = RUTAS_EXCLUIDAS.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );

  const cerrar = useCallback(() => {
    setAbierto(false);
    guardarMarca("cerrado");
    medir("popup_cerrado");
    focoPrevio.current?.focus();
  }, []);

  // Ir al formulario cuenta como conversion del popup, no como cierre: se
  // guarda la marca para que no vuelva a aparecer, pero sin marcarlo cerrado.
  const irAlFormulario = useCallback(() => {
    guardarMarca("enviado");
    medir("popup_click");
    setAbierto(false);
  }, []);

  // ── Cuando corresponde abrirlo ──────────────────────────────────
  useEffect(() => {
    if (excluida) return;

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
      medir("popup_visto");
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

    const splashTermino = () => {
      try {
        return sessionStorage.getItem(CLAVE_SPLASH) === "1";
      } catch {
        return true;
      }
    };

    const timer = setTimeout(() => {
      if (forzado) {
        if (splashTermino()) {
          abrir();
          return;
        }
        const limiteSplash = Date.now() + ESPERA_SPLASH_MS;
        reintento = setInterval(() => {
          if (splashTermino() || Date.now() >= limiteSplash) {
            if (reintento) clearInterval(reintento);
            abrir();
          }
        }, 200);
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
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
    dialogoRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, cerrar]);

  if (!abierto) return null;

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
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white"
      >
        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/35"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Imagen: el leon de la marca, el mismo del splash */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a4a5a] via-[#2B6E80] to-[#1e3a4a] px-6 pb-4 pt-7">
          <div className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-[#F4B860]/15 blur-2xl" />
          <svg
            viewBox="555 0 410 300"
            className="relative mx-auto h-24 w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
            role="img"
            aria-label="León de LinaresYa"
          >
            <defs>
              <linearGradient id="popupLeonOro" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F8D48A" />
                <stop offset="55%" stopColor="#F4B860" />
                <stop offset="100%" stopColor="#D99A3F" />
              </linearGradient>
            </defs>
            {/* Solo la cabeza: el grupo "body" son las letras de INFOBLACK,
                que no van en un aviso de LinaresYa, y la cola sin ellas queda
                suelta. El viewBox recorta a la melena. */}
            {LEON.draw
              .filter((p) => p.g === "mane")
              .map((p, i) => (
                <path key={i} d={p.d} fill="url(#popupLeonOro)" />
              ))}
          </svg>
        </div>

        <div className="px-6 pb-6 pt-5 text-center">
          <h2
            id="popup-negocio-titulo"
            className="text-[22px] font-black leading-tight tracking-tight text-[#1A1410]"
          >
            Registra tu negocio y ten más presencia digital
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6B5E57]">
            Gratis, sin registro y en 3 minutos. Apareces frente a los vecinos de
            Linares que buscan lo que ofreces.
          </p>

          <Link
            href={DESTINO}
            onClick={irAlFormulario}
            className="mt-5 block w-full rounded-full bg-[#1A1410] px-6 py-4 text-base font-bold text-white transition hover:bg-[#2B6E80] active:scale-[0.98]"
          >
            Registrar mi negocio →
          </Link>

          <button
            type="button"
            onClick={cerrar}
            className="mt-3 text-[13px] font-semibold text-[#8E8279] transition hover:text-[#1A1410]"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
