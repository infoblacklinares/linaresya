"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function PwaInit() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // No mostrar si ya está instalada como app
    if (isInStandaloneMode()) return;

    // No mostrar si el usuario ya la descartó de forma permanente
    if (localStorage.getItem("pwa-no-show")) return;

    // Capturar el prompt nativo (Android/Chrome) para usarlo luego
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Mostrar el banner inmediatamente
    setVisible(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android/Chrome: lanzar diálogo nativo
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
        localStorage.setItem("pwa-no-show", "1");
      }
    } else if (isIos()) {
      // iOS Safari: mostrar guía manual
      setShowIosGuide(true);
    } else {
      // Otros: ocultar silenciosamente
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("pwa-no-show", "1");
  };

  if (!visible) return null;

  return (
    <>
      {/* Banner principal */}
      <div
        role="dialog"
        aria-label="Instalar LinaresYa"
        className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-[#2B6E80] px-4 py-4 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          {/* Ícono */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
            </svg>
          </div>

          {/* Texto */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white leading-tight">
              Instala LinaresYa
            </p>
            <p className="text-xs text-white/75 leading-tight mt-0.5">
              Acceso rápido desde tu pantalla de inicio
            </p>
          </div>

          {/* Cerrar */}
          <button
            onClick={handleDismiss}
            aria-label="No gracias"
            className="shrink-0 text-white/50 hover:text-white transition text-xl leading-none px-1"
          >
            ✕
          </button>
        </div>

        {/* Botones de acción */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 rounded-xl border border-white/30 py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 active:scale-95"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 rounded-xl bg-white py-2.5 text-xs font-bold text-[#2B6E80] transition hover:bg-white/90 active:scale-95"
          >
            Instalar gratis →
          </button>
        </div>
      </div>

      {/* Guía iOS */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl bg-white p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-black text-[#1A1410]">Cómo instalar en iPhone</h2>
              <button
                onClick={() => { setShowIosGuide(false); setVisible(false); }}
                className="text-[#8E8279] text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2B6E80] text-xs font-bold text-white">1</span>
                <div>
                  <p className="text-sm font-semibold text-[#1A1410]">Toca el ícono de compartir</p>
                  <p className="text-xs text-[#6B5E57] mt-0.5">El cuadro con flecha hacia arriba en Safari (↑)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2B6E80] text-xs font-bold text-white">2</span>
                <div>
                  <p className="text-sm font-semibold text-[#1A1410]">Selecciona &quot;Agregar a inicio&quot;</p>
                  <p className="text-xs text-[#6B5E57] mt-0.5">Desplázate hacia abajo en el menú compartir</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2B6E80] text-xs font-bold text-white">3</span>
                <div>
                  <p className="text-sm font-semibold text-[#1A1410]">Toca &quot;Agregar&quot;</p>
                  <p className="text-xs text-[#6B5E57] mt-0.5">LinaresYa aparecerá en tu pantalla de inicio</p>
                </div>
              </li>
            </ol>

            <button
              onClick={() => { setShowIosGuide(false); setVisible(false); localStorage.setItem("pwa-no-show", "1"); }}
              className="mt-6 w-full rounded-xl bg-[#2B6E80] py-3 text-sm font-bold text-white transition active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
