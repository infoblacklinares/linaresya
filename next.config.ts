import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fija la raíz de Turbopack para evitar el error de detección de workspace
  // cuando hay múltiples lockfiles en directorios superiores.
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    serverActions: {
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

export default nextConfig;
