import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LinaresYa - Lo mejor de Linares en un solo lugar",
    template: "%s | LinaresYa",
  },
  description:
    "Directorio local de negocios, oficios y servicios en Linares, Chile. Encuentra restaurantes, veterinarias, maestros, tiendas y mas, todo en un solo lugar.",
  keywords: [
    "Linares",
    "Linares Chile",
    "directorio Linares",
    "negocios Linares",
    "delivery Linares",
    "servicios Linares",
    "Maule",
  ],
  applicationName: "LinaresYa",
  authors: [{ name: "LinaresYa" }],
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteUrl,
    siteName: "LinaresYa",
    title: "LinaresYa - Lo mejor de Linares en un solo lugar",
    description:
      "Directorio local de negocios, oficios y servicios en Linares, Chile.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinaresYa",
    description:
      "Directorio local de negocios, oficios y servicios en Linares, Chile.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "aVwByyabkiNUH3UAai9pY3TErwrR0c831Dh8KwsdByc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground pb-20 font-sans">
        {children}
      </body>
    </html>
  );
}
