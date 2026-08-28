import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Android usa `name` como rotulo de la splash nativa: corto para que
    // no salga en dos lineas apretadas bajo el icono.
    name: "LinaresYa",
    short_name: "LinaresYa",
    description:
      "Directorio local de negocios, oficios y servicios en Linares, Chile.",
    start_url: "/",
    display: "standalone",
    // Mismo negro que SplashLeon: la splash nativa encadena con la
    // animacion sin un destello blanco de por medio.
    background_color: "#0f0f10",
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
        // Version aparte con mas margen: Android recorta el maskable en
        // circulo y el icono `any` perderia parte de la melena.
        src: "/web-app-manifest-maskable-512x512.png",
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
