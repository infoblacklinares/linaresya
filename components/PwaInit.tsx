"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInit() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => { /* silencioso en dev */ });
    }

    // Capturar evento de instalación
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Mostrar banner solo si no lo descartó antes
      const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
      if (!dismissed) setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar LinaresYa"
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl bg-[#2B6E80] px-4 py-3 shadow-2xl"
    >
      {/* Ícono */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
        </svg>
      </div>

      {/* Texto */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white leading-tight">
          Instala LinaresYa
        </p>
        <p className="text-xs text-white/75 leading-tight">
          Acceso rápido desde tu pantalla de inicio
        </p>
      </div>

      {/* Botones */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={handleDismiss}
          aria-label="Cerrar"
          className="text-white/60 hover:text-white transition text-lg leading-none px-1"
        >
          ✕
        </button>
        <button
          onClick={handleInstall}
          className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#2B6E80] transition hover:bg-white/90 active:scale-95"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}
