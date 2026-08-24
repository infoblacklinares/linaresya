'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// GA4: se carga solo si hay medicion configurada. Sin
// NEXT_PUBLIC_GA_ID no inyectamos nada (antes se inyectaba el id de ejemplo
// "G-XXXXXXXXXX", que ademas el CSP bloquea).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

let gaCargado = false;

function cargarGoogleAnalytics() {
  if (!GA_ID || gaCargado) return;
  gaCargado = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => {
    window.dataLayer.push(args);
  };
  gtag('js', new Date());
  gtag('config', GA_ID);
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // localStorage solo existe en el navegador: por eso se lee al montar y
    // no en el render inicial, que tambien corre en el servidor. El render
    // extra es intencional: asi el banner nunca sale en el HTML estatico.
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ver nota de arriba
      setIsVisible(true);
    } else if (consent === 'accepted') {
      cargarGoogleAnalytics();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    cargarGoogleAnalytics();
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-border backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
            <p className="mb-2">
              <span className="font-semibold text-foreground">Usamos cookies</span> para mejorar tu experiencia. Conforme a la{' '}
              <Link href="/privacidad" className="text-primary hover:underline font-semibold">
                Ley 21.719
              </Link>
              , puedes aceptar o rechazar cookies de rastreo.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-3 py-2 text-sm font-medium text-foreground border border-border rounded-md hover:bg-muted transition-colors whitespace-nowrap"
            >
              Rechazar
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
