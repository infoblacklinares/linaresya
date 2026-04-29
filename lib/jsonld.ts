// Helpers para generar JSON-LD (Schema.org) que Google y otros buscadores
// usan para mostrar rich results: mapas, horarios, rating, knowledge panel,
// etc. Cada funcion retorna un objeto plano; la inyeccion se hace con
// <JsonLd data={...} /> en el componente.

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.vercel.app";

// --- Tipos compartidos ---------------------------------------------------

type Dia =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

type Horario = {
  dia: Dia;
  abre: string | null;
  cierra: string | null;
  cerrado: boolean;
};

type Resena = {
  id: number;
  autor_nombre: string;
  estrellas: number;
  comentario: string | null;
  creado_en: string;
};

export type NegocioJsonLd = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  tipo: "negocio" | "independiente";
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  sitio_web: string | null;
  direccion: string | null;
  ciudad: string | null;
  lat: number | null;
  lng: number | null;
  foto_portada: string | null;
};

export type CategoriaJsonLd = {
  nombre: string;
  slug: string;
  emoji: string;
};

// Mapeo dia -> formato Schema.org (ingles).
const DIA_MAP: Record<Dia, string> = {
  lunes: "Monday",
  martes: "Tuesday",
  miercoles: "Wednesday",
  jueves: "Thursday",
  viernes: "Friday",
  sabado: "Saturday",
  domingo: "Sunday",
};

// Mapeo categoria -> subtipo Schema.org mas especifico. Si no hay match,
// LocalBusiness sirve bien como default.
const SCHEMA_TYPE_BY_CATEGORY_SLUG: Record<string, string> = {
  "comida-rapida": "FastFoodRestaurant",
  restaurantes: "Restaurant",
  cafeterias: "CafeOrCoffeeShop",
  panaderias: "Bakery",
  "pasteles-y-postres": "Bakery",
  almacenes: "ConvenienceStore",
  supermercados: "GroceryStore",
  farmacias: "Pharmacy",
  peluquerias: "HairSalon",
  barberias: "HairSalon",
  "belleza-y-estetica": "BeautySalon",
  "taller-mecanico": "AutoRepair",
  lavanderias: "DryCleaningOrLaundry",
  gimnasios: "ExerciseGym",
  veterinarias: "VeterinaryCare",
  ferreterias: "HardwareStore",
  "servicios-del-hogar": "HomeAndConstructionBusiness",
  clinicas: "MedicalClinic",
  dentistas: "Dentist",
  hoteles: "LodgingBusiness",
};

function schemaTypeFor(categoriaSlug: string): string {
  return SCHEMA_TYPE_BY_CATEGORY_SLUG[categoriaSlug] ?? "LocalBusiness";
}

// --- LocalBusiness -------------------------------------------------------

export function localBusinessJsonLd(
  negocio: NegocioJsonLd,
  categoria: CategoriaJsonLd,
  horarios: Horario[],
  resenas: Resena[],
): Record<string, unknown> {
  const url = `${SITE_URL}/${categoria.slug}/${negocio.slug}`;

  // Direccion postal. Siempre Linares/Maule/CL porque el sitio es hyperlocal.
  const address = {
    "@type": "PostalAddress",
    streetAddress: negocio.direccion ?? undefined,
    addressLocality: negocio.ciudad ?? "Linares",
    addressRegion: "Maule",
    addressCountry: "CL",
  };

  // Geo (si hay coordenadas).
  const geo =
    negocio.lat !== null && negocio.lng !== null
      ? {
          "@type": "GeoCoordinates",
          latitude: negocio.lat,
          longitude: negocio.lng,
        }
      : undefined;

  // Opening hours: solo dias no-cerrados con abre+cierra definidos.
  const openingHoursSpecification = horarios
    .filter((h) => !h.cerrado && h.abre && h.cierra)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DIA_MAP[h.dia],
      opens: h.abre,
      closes: h.cierra,
    }));

  // Rating agregado si hay resenas aprobadas.
  let aggregateRating: Record<string, unknown> | undefined;
  if (resenas.length > 0) {
    const avg = resenas.reduce((a, r) => a + r.estrellas, 0) / resenas.length;
    aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(avg.toFixed(1)),
      reviewCount: resenas.length,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // sameAs: WhatsApp como canal oficial si lo tiene.
  const sameAs: string[] = [];
  if (negocio.sitio_web) sameAs.push(negocio.sitio_web);
  if (negocio.whatsapp) sameAs.push(`https://wa.me/${negocio.whatsapp}`);

  // Telefono en formato E.164 si empieza con digitos.
  const telephone = negocio.telefono
    ? negocio.telefono.startsWith("+")
      ? negocio.telefono
      : `+${negocio.telefono.replace(/\D/g, "")}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": schemaTypeFor(categoria.slug),
    "@id": url,
    name: negocio.nombre,
    description: negocio.descripcion ?? undefined,
    url,
    telephone,
    email: negocio.email ?? undefined,
    image: negocio.foto_portada ?? undefined,
    address,
    geo,
    openingHoursSpecification:
      openingHoursSpecification.length > 0 ? openingHoursSpecification : undefined,
    aggregateRating,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    areaServed: "Linares, Maule, Chile",
  };
}

// --- BreadcrumbList ------------------------------------------------------

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// --- ItemList (para paginas de categoria) --------------------------------

export function itemListJsonLd(
  items: Array<{ nombre: string; slug: string }>,
  categoriaSlug: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/${categoriaSlug}/${n.slug}`,
      name: n.nombre,
    })),
  };
}

// --- Home: Organization + WebSite con SearchAction -----------------------

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: "LinaresYa",
    url: SITE_URL,
    description:
      "Directorio local de negocios, oficios y servicios en Linares, Chile.",
    areaServed: {
      "@type": "City",
      name: "Linares",
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Region del Maule",
      },
    },
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: "LinaresYa",
    inLanguage: "es-CL",
    publisher: { "@id": `${SITE_URL}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/buscar?q={search_term_string}`,
      },
      // Schema.org requiere este input name (sin comillas fancy).
      "query-input": "required name=search_term_string",
    },
  };
}
