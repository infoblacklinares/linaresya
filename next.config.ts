import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // El default es 1MB. Subimos a 6MB para permitir foto_portada + galeria.
      // Vercel Hobby permite hasta ~4.5 MB por funcion serverless. Cuando
      // necesitemos mas (galeria de 4 fotos, etc) hay que migrar a uploads
      // directos a Storage con signed URLs.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

// Solo wrappear con Sentry si esta configurado el DSN. Asi en dev local sin
// Sentry el build no falla y no se usa cuota gratuita en deploys de preview.
const sentryEnabled = !!process.env.SENTRY_DSN || !!process.env.NEXT_PUBLIC_SENTRY_DSN;

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      // Org y proyecto solo se necesitan si subis source maps.
      // Sin SENTRY_AUTH_TOKEN, el build sigue: solo no envia source maps.
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // Suprimimos warnings cuando no hay auth token (caso comun en MVP)
      silent: !process.env.CI,
      // Telemetria de Sentry: la apagamos para ahorrar request al build
      telemetry: false,
      // No tirar el build si la subida de source maps falla
      sourcemaps: {
        disable: !process.env.SENTRY_AUTH_TOKEN,
      },
      // Tunnel para evitar que adblockers bloqueen los requests a Sentry.
      // Crea una API route /monitoring que proxy a sentry.io.
      tunnelRoute: "/monitoring",
      // Hide source maps publicos del cliente
      hideSourceMaps: true,
      // Disable react component annotation (poco util, agrega bundle)
      reactComponentAnnotation: { enabled: false },
    })
  : nextConfig;
