import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import TrackedActionButton from "./TrackedActionButton";
import LeaveReviewForm from "./LeaveReviewForm";
import ShareButton from "./ShareButton";
import JsonLd from "@/components/JsonLd";
import { localBusinessJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
// Regex permisivo para detectar bots/crawlers conocidos. No queremos
// inflar las vistas con Googlebot, scrapers, link previews, etc.
const BOT_UA_RE =
  /bot|crawler|spider|crawl|googlebot|bingbot|yandex|baidu|duckduck|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|discord|preview|fetch/i;

async function trackVista(negocioId: string) {
  try {
    const h = await headers();
    const ua = h.get("user-agent") ?? "";
    if (BOT_UA_RE.test(ua)) return; // skip bots
    await supabase.rpc("incrementar_estadistica", {
      p_negocio_id: negocioId,
      p_evento: "vista",
    });
  } catch {
    // El tracking nunca debe tirar la pagina.
  }
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.vercel.app";

type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  emoji: string;
};

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  categoria_id: number;
  tipo: "negocio" | "independiente";
  plan: "basico" | "premium";
  verificado: boolean;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  sitio_web: string | null;
  direccion: string | null;
  ciudad: string | null;
  lat: number | null;
  lng: number | null;
  a_domicilio: boolean;
  zona_cobertura: string | null;
  disponibilidad: string | null;
  foto_portada: string | null;
  creado_en: string;
};

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

type Foto = { id: number; url: string; orden: number };

type Resena = {
  id: number;
  autor_nombre: string;
  estrellas: number;
  comentario: string | null;
  vecino_verificado: boolean;
  creado_en: string;
};

const DIAS_ORDEN: Dia[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const DIAS_LABEL: Record<Dia, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miercoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sabado",
  domingo: "Domingo",
};

function diaHoy(): Dia {
  const f = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    timeZone: "America/Santiago",
  }).format(new Date());
  const norm = f.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return (DIAS_ORDEN.includes(norm as Dia) ? norm : "lunes") as Dia;
}

function horaAhora(): string {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Santiago",
  }).format(new Date());
}

function estaAbierto(horarios: Horario[]): {
  abierto: boolean;
  horarioHoy?: Horario;
} {
  const d = diaHoy();
  const h = horarios.find((x) => x.dia === d);
  if (!h || h.cerrado || !h.abre || !h.cierra) return { abierto: false, horarioHoy: h };
  const ahora = horaAhora();
  const abre = h.abre.slice(0, 5);
  const cierra = h.cierra.slice(0, 5);
  return { abierto: ahora >= abre && ahora < cierra, horarioHoy: h };
}

function fmtHora(h: string | null): string {
  if (!h) return "";
  return h.slice(0, 5);
}

function whatsAppLink(waRaw: string, nombre: string): string {
  const num = waRaw.replace(/\D/g, "");
  const msg = encodeURIComponent(`Hola! Te contacto desde LinaresYa por ${nombre}.`);
  return `https://wa.me/${num}?text=${msg}`;
}

function telLink(tel: string): string {
  return `tel:${tel.replace(/\s/g, "")}`;
}

function mapsLink(n: Negocio): string | null {
  if (n.lat != null && n.lng != null) return `https://www.google.com/maps/search/?api=1&query=${n.lat},${n.lng}`;
  if (n.direccion) {
    const q = encodeURIComponent(`${n.direccion}, ${n.ciudad ?? "Linares"}, Chile`);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }
  return null;
}

// URL del iframe embed de Google Maps. Usa el endpoint /maps?q=...&output=embed
// que no requiere API key (a diferencia del Embed API oficial). Si hay lat/lng
// los usa; si no, geocodifica con la direccion + ciudad.
function mapsEmbed(n: Negocio): string | null {
  if (n.lat != null && n.lng != null) {
    return `https://www.google.com/maps?q=${n.lat},${n.lng}&z=16&output=embed`;
  }
  if (n.direccion) {
    const q = encodeURIComponent(`${n.direccion}, ${n.ciudad ?? "Linares"}, Chile`);
    return `https://www.google.com/maps?q=${q}&z=16&output=embed`;
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; negocio: string }>;
}): Promise<Metadata> {
  const { slug: categoriaSlug, negocio: negocioSlug } = await params;

  const { data: cat } = await supabase
    .from("categorias")
    .select("id,nombre,slug,emoji")
    .eq("slug", categoriaSlug)
    .single();

  if (!cat) return { title: "Negocio no encontrado" };

  const { data: neg } = await supabase
    .from("negocios")
    .select("nombre,slug,descripcion,direccion,foto_portada")
    .eq("slug", negocioSlug)
    .eq("categoria_id", (cat as { id: number }).id)
    .eq("activo", true)
    .single();

  if (!neg) return { title: "Negocio no encontrado" };

  const n = neg as {
    nombre: string;
    slug: string;
    descripcion: string | null;
    direccion: string | null;
    foto_portada: string | null;
  };
  const c = cat as { nombre: string; slug: string; emoji: string };

  const titulo = `${n.nombre} - ${c.nombre} en Linares`;
  const descripcion = (
    n.descripcion ??
    `${n.nombre}, ${c.nombre.toLowerCase()} en Linares${
      n.direccion ? `. Direccion: ${n.direccion}` : ""
    }. Telefono, horarios, ubicacion y mas en LinaresYa.`
  ).slice(0, 160);

  const url = `${SITE_URL}/${c.slug}/${n.slug}`;
  const imagen = n.foto_portada ?? null;

  // OpenGraph: si el negocio tiene foto_portada usamos esa (mas real).
  // Si no, OMITIMOS la key images y Next usa app/[slug]/[negocio]/opengraph-image.tsx,
  // que genera una tarjeta con el nombre + categoria. Twitter card siempre
  // summary_large_image porque ahora siempre hay imagen (foto o generada).
  const openGraph: Metadata["openGraph"] = {
    type: "website",
    locale: "es_CL",
    url,
    siteName: "LinaresYa",
    title: titulo,
    description: descripcion,
  };
  const twitter: Metadata["twitter"] = {
    card: "summary_large_image",
    title: titulo,
    description: descripcion,
  };
  if (imagen) {
    openGraph.images = [{ url: imagen, alt: n.nombre }];
    twitter.images = [imagen];
  }

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    openGraph,
    twitter,
  };
}

export default async function NegocioDetalle({
  params,
}: {
  params: Promise<{ slug: string; negocio: string }>;
}) {
  const { slug: categoriaSlug, negocio: negocioSlug } = await params;

  const { data: cat } = await supabase
    .from("categorias")
    .select("id,nombre,slug,emoji")
    .eq("slug", categoriaSlug)
    .single();

  if (!cat) notFound();
  const categoria = cat as Categoria;

  const { data: neg } = await supabase
    .from("negocios")
    .select("*")
    .eq("slug", negocioSlug)
    .eq("categoria_id", categoria.id)
    .eq("activo", true)
    .single();

  if (!neg) notFound();
  const n = neg as Negocio;

  const [{ data: horariosData }, { data: fotosData }, { data: resenasData }] =
    await Promise.all([
      supabase
        .from("horarios")
        .select("dia,abre,cierra,cerrado")
        .eq("negocio_id", n.id),
      supabase
        .from("fotos")
        .select("id,url,orden")
        .eq("negocio_id", n.id)
        .order("orden"),
      supabase
        .from("resenas")
        .select(
          "id,autor_nombre,estrellas,comentario,vecino_verificado,creado_en",
        )
        .eq("negocio_id", n.id)
        .eq("aprobada", true)
        .order("creado_en", { ascending: false })
        .limit(5),
    ]);

  const horarios = (horariosData ?? []) as Horario[];
  const fotos = (fotosData ?? []) as Foto[];
  const resenas = (resenasData ?? []) as Resena[];

  const { abierto, horarioHoy } = estaAbierto(horarios);
  const tieneHorariosEstructurados = horarios.length > 0;
  const esPremium = n.plan === "premium";
  const wa = esPremium && n.whatsapp ? whatsAppLink(n.whatsapp, n.nombre) : null;
  const tel = n.telefono ? telLink(n.telefono) : null;
  const maps = mapsLink(n);
  const mapEmbedUrl = mapsEmbed(n);

  const ratingPromedio =
    resenas.length > 0
      ? (
          resenas.reduce((acc, r) => acc + r.estrellas, 0) / resenas.length
        ).toFixed(1)
      : null;

  // Fire-and-forget: no bloqueamos el render si tarda.
  void trackVista(n.id);

  // JSON-LD structured data: LocalBusiness + BreadcrumbList. Google los usa
  // para rich results, knowledge panel, y mejor ranking en "cerca de mi".
  const negocioJsonLdData = localBusinessJsonLd(
    {
      id: n.id,
      nombre: n.nombre,
      slug: n.slug,
      descripcion: n.descripcion,
      tipo: n.tipo,
      telefono: n.telefono,
      whatsapp: n.whatsapp,
      email: n.email,
      sitio_web: n.sitio_web,
      direccion: n.direccion,
      ciudad: n.ciudad,
      lat: n.lat,
      lng: n.lng,
      foto_portada: n.foto_portada,
    },
    {
      nombre: categoria.nombre,
      slug: categoria.slug,
      emoji: categoria.emoji,
    },
    horarios,
    resenas,
  );
  const breadcrumbData = breadcrumbJsonLd([
    { name: "Inicio", url: SITE_URL },
    { name: categoria.nombre, url: `${SITE_URL}/${categoria.slug}` },
    {
      name: n.nombre,
      url: `${SITE_URL}/${categoria.slug}/${n.slug}`,
    },
  ]);

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      <JsonLd id="ld-negocio" data={negocioJsonLdData} />
      <JsonLd id="ld-breadcrumb" data={breadcrumbData} />
      <section className="relative">
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-secondary">
          {n.foto_portada ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={n.foto_portada}
              alt={n.nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-7xl">
              {categoria.emoji}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
          <Link
            href={`/${categoria.slug}`}
            aria-label="Volver"
            className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white/95 flex items-center justify-center ue-shadow hover:bg-white transition"
          >
            <BackIcon />
          </Link>
          {esPremium && (
            <span className="absolute top-4 right-4 text-[10px] font-bold bg-foreground text-background px-2.5 py-1 rounded-full">
              Premium
            </span>
          )}
        </div>

        <div className="px-4 pt-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {categoria.emoji} {categoria.nombre}
            {n.tipo === "independiente" ? " - Independiente" : ""}
          </p>
          <div className="flex items-start gap-2 mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              {n.nombre}
            </h1>
            {n.verificado && <VerifiedIcon />}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {tieneHorariosEstructurados ? (
              <>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold ${
                    abierto
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      abierto ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  {abierto ? "Abierto ahora" : "Cerrado ahora"}
                </span>
                {horarioHoy && !horarioHoy.cerrado && horarioHoy.abre && (
                  <span className="text-muted-foreground">
                    Hoy {fmtHora(horarioHoy.abre)} - {fmtHora(horarioHoy.cierra)}
                  </span>
                )}
              </>
            ) : n.disponibilidad ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold bg-sky-50 text-sky-700">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                {n.disponibilidad}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold bg-secondary text-muted-foreground">
                Consultar horario
              </span>
            )}
            {n.a_domicilio && (
              <span className="bg-secondary text-foreground px-2.5 py-1 rounded-full font-medium">
                A domicilio
              </span>
            )}
            {ratingPromedio && (
              <span className="inline-flex items-center gap-1 font-semibold">
                {"\u2B50"} {ratingPromedio}
                <span className="text-muted-foreground font-normal">
                  ({resenas.length})
                </span>
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 mt-5">
        <div className="grid grid-cols-3 gap-2">
          {wa ? (
            <TrackedActionButton
              href={wa}
              negocioId={n.id}
              evento="whatsapp"
              external
              icon={<WhatsAppIcon />}
              label="WhatsApp"
              primary
            />
          ) : (
            <ActionButton
              disabled
              icon={<WhatsAppIcon />}
              label="Solo Premium"
            />
          )}
          {tel ? (
            <TrackedActionButton
              href={tel}
              negocioId={n.id}
              evento="telefono"
              icon={<PhoneIcon />}
              label="Llamar"
            />
          ) : (
            <ActionButton disabled icon={<PhoneIcon />} label="Llamar" />
          )}
          {maps ? (
            <TrackedActionButton
              href={maps}
              negocioId={n.id}
              evento="maps"
              external
              icon={<MapIcon />}
              label="Llegar"
            />
          ) : (
            <ActionButton disabled icon={<MapIcon />} label="Sin direccion" />
          )}
        </div>
        <div className="mt-2">
          <ShareButton
            url={`${SITE_URL}/${categoria.slug}/${n.slug}`}
            title={n.nombre}
            text={`${n.nombre} en LinaresYa - ${categoria.nombre}`}
          />
        </div>
      </section>

      {n.descripcion && (
        <section className="px-4 mt-6">
          <h2 className="text-base font-bold mb-2">Acerca de</h2>
          <p className="text-[14px] leading-relaxed text-foreground/80 whitespace-pre-line">
            {n.descripcion}
          </p>
        </section>
      )}

      <section className="px-4 mt-6">
        <h2 className="text-base font-bold mb-2">Horarios</h2>
        {tieneHorariosEstructurados ? (
          <>
            <ul className="rounded-2xl bg-secondary/60 divide-y divide-border overflow-hidden">
              {DIAS_ORDEN.map((d) => {
                const h = horarios.find((x) => x.dia === d);
                const isToday = d === diaHoy();
                return (
                  <li
                    key={d}
                    className={`flex items-center justify-between px-4 py-2.5 text-[13px] ${
                      isToday ? "bg-white font-semibold" : ""
                    }`}
                  >
                    <span>
                      {DIAS_LABEL[d]}
                      {isToday && (
                        <span className="ml-2 text-[10px] font-bold text-muted-foreground uppercase">
                          Hoy
                        </span>
                      )}
                    </span>
                    <span
                      className={
                        !h || h.cerrado ? "text-muted-foreground" : "text-foreground"
                      }
                    >
                      {!h || h.cerrado
                        ? "Cerrado"
                        : `${fmtHora(h.abre)} - ${fmtHora(h.cierra)}`}
                    </span>
                  </li>
                );
              })}
            </ul>
            {n.disponibilidad && (
              <p className="mt-2 text-[12px] text-muted-foreground italic px-1">
                {n.disponibilidad}
              </p>
            )}
          </>
        ) : n.disponibilidad ? (
          <div className="rounded-2xl bg-secondary/60 px-4 py-3 text-[14px] whitespace-pre-line">
            {n.disponibilidad}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Consulta directamente con el negocio.
          </div>
        )}
      </section>

      {(n.direccion || n.zona_cobertura) && (
        <section className="px-4 mt-6">
          <h2 className="text-base font-bold mb-2">Ubicacion</h2>
          <div className="rounded-2xl bg-secondary/60 p-4 text-[14px]">
            {n.direccion && (
              <p>
                {"\u{1F4CD}"} {n.direccion}
                {n.ciudad ? `, ${n.ciudad}` : ""}
              </p>
            )}
            {n.zona_cobertura && (
              <p className="mt-1 text-muted-foreground">
                Cobertura: {n.zona_cobertura}
              </p>
            )}
            {maps && (
              <a
                href={maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600"
              >
                Ver en Google Maps {"\u2192"}
              </a>
            )}
          </div>
          {mapEmbedUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-border bg-secondary/40">
              <iframe
                src={mapEmbedUrl}
                title={`Mapa de ${n.nombre}`}
                width="100%"
                height="240"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          )}
        </section>
      )}

      {fotos.length > 0 && (
        <section className="mt-6">
          <h2 className="px-4 text-base font-bold mb-2">Galeria</h2>
          <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar">
            {fotos.map((f) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={f.id}
                src={f.url}
                alt=""
                className="h-32 w-40 sm:h-40 sm:w-52 rounded-2xl object-cover shrink-0"
              />
            ))}
          </div>
        </section>
      )}

      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold">Resenas</h2>
          {ratingPromedio && (
            <span className="text-sm font-semibold">
              {"\u2B50"} {ratingPromedio}{" "}
              <span className="text-muted-foreground font-normal">
                - {resenas.length}
              </span>
            </span>
          )}
        </div>
        {resenas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Todavia no hay resenas. Se el primero en dejar una.
          </div>
        ) : (
          <ul className="space-y-3">
            {resenas.map((r) => (
              <li key={r.id} className="rounded-2xl bg-secondary/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="font-semibold text-sm truncate">{r.autor_nombre}</p>
                    {r.vecino_verificado && (
                      <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full shrink-0">
                        Vecino verificado
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold shrink-0">
                    {"\u2B50".repeat(Math.max(1, Math.min(5, r.estrellas)))}
                  </span>
                </div>
                {r.comentario && (
                  <p className="text-[13px] text-foreground/80 mt-1.5 leading-relaxed">
                    {r.comentario}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <details className="mt-4 group">
          <summary className="cursor-pointer list-none rounded-full bg-foreground text-background text-sm font-semibold px-5 py-3 text-center hover:opacity-90 transition group-open:hidden">
            Dejar tu resena
          </summary>
          <div className="mt-3">
            <LeaveReviewForm
              negocioId={n.id}
              categoriaSlug={categoria.slug}
              negocioSlug={n.slug}
            />
          </div>
        </details>
      </section>

      <section className="px-4 mt-8 pb-6 text-center text-[11px] text-muted-foreground space-y-1.5">
        <p>
          En LinaresYa desde{" "}
          {new Date(n.creado_en).toLocaleDateString("es-CL", {
            month: "long",
            year: "numeric",
            timeZone: "America/Santiago",
          })}
        </p>
        <p>
          <Link
            href="/dueno/solicitar"
            className="underline hover:text-foreground transition"
          >
            ¿Sos el dueño? Editar este negocio
          </Link>
        </p>
      </section>
    </main>
  );
}

function ActionButton({
  href,
  icon,
  label,
  external = false,
  primary = false,
  disabled = false,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
  primary?: boolean;
  disabled?: boolean;
}) {
  const cls = `flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-xs font-semibold transition ${
    disabled
      ? "bg-secondary text-muted-foreground cursor-not-allowed"
      : primary
        ? "bg-emerald-500 text-white hover:bg-emerald-600"
        : "bg-foreground text-background hover:opacity-90"
  }`;
  if (disabled || !href) return <span className={cls}>{icon}{label}</span>;
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cls}
    >
      {icon}
      {label}
    </a>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
function VerifiedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-sky-500 shrink-0 mt-1.5">
      <path d="M12 2 9.5 4.5 6 4l-.5 3.5L2 9l2 3-2 3 3.5 1.5L6 20l3.5-.5L12 22l2.5-2.5L18 20l.5-3.5L22 15l-2-3 2-3-3.5-1.5L18 4l-3.5.5L12 2Zm-1.2 13.6-3.2-3.2 1.4-1.4 1.8 1.8 4.4-4.4 1.4 1.4-5.8 5.8Z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 3 17l-1 5 5.2-1.4A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 20.5Z" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.4 2.1L8 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
