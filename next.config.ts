import type { NextConfig } from "next";

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

export default nextConfig;
