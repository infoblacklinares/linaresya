'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else if (consent === 'accepted') {
      loadGoogleAnalytics();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    loadGoogleAnalytics();
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
  };

  const loadGoogleAnalytics = () => {
    // GA4 script injection
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
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
