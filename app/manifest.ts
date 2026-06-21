import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LinaresYa - Directorio local de Linares",
    short_name: "LinaresYa",
    description:
      "Directorio local de negocios, oficios y servicios en Linares, Chile.",
    start_url: "/",
    display: "standalone",
    background_color: "#F9F8F6",
    theme_color: "#2B6E80",
    orientation: "portrait",
    lang: "es-CL",
    categories: ["lifestyle", "shopping", "business"],
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Buscar",
        short_name: "Buscar",
        url: "/buscar",
      },
      {
        name: "Publicar negocio",
        short_name: "Publicar",
        url: "/publicar",
      },
      {
        name: "Mis favoritos",
        short_name: "Favoritos",
        url: "/favoritos",
      },
    ],
  };
}
