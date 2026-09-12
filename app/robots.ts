import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // `/dueno/` completo: las URLs de estadisticas tambien llevan el token
        // del dueño, asi que no tienen por que entrar a ningun indice (LY-023).
        disallow: ["/admin/", "/api/", "/dueno/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
