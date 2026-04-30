import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LinaresYa - Directorio local de Linares",
    short_name: "LinaresYa",
    description:
      "Directorio local de negocios, oficios y servicios en Linares, Chile.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    orientation: "portrait",
    lang: "es-CL",
    categories: ["lifestyle", "shopping", "business"],
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
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
