import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  nombre_autor: string;
  calificacion: number;
  comentario: string | null;
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
        .select("id,nombre_autor,calificacion,comentario,creado_en")
        .eq("negocio_id", n.id)
        .eq("aprobada", true)
        .order("creado_en", { ascending: false })
        .limit(5),
    ]);

  const horarios = (horariosData ?? []) as Horario[];
  const fotos = (fotosData ?? []) as Foto[];
  const resenas = (resenasData ?? []) as Resena[];

  const { abierto, horarioHoy } = estaAbierto(horarios);
  const esPremium = n.plan === "premium";
  const wa = esPremium && n.whatsapp ? whatsAppLink(n.whatsapp, n.nombre) : null;
  const tel = n.telefono ? telLink(n.telefono) : null;
  const maps = mapsLink(n);

  const ratingPromedio =
    resenas.length > 0
      ? (
          resenas.reduce((acc, r) => acc + r.calificacion, 0) / resenas.length
        ).toFixed(1)
      : null;

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      {/* Hero */}
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
            {n.tipo === "independiente" ? " · Independiente" : ""}
          </p>
          <div className="flex items-start gap-2 mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              {n.nombre}
            </h1>
            {n.verificado && <VerifiedIcon />}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
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
                Hoy {fmtHora(horarioHoy.abre)} – {fmtHora(horarioHoy.cierra)}
              </span>
            )}
            {n.a_domicilio && (
              <span className="bg-secondary text-foreground px-2.5 py-1 rounded-full font-medium">
                A domicilio
              </span>
            )}
            {ratingPromedio && (
              <span className="inline-flex items-center gap-1 font-semibold">
                ⭐ {ratingPromedio}
                <span className="text-muted-foreground font-normal">
                  ({resenas.length})
                </span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Acciones rapidas */}
      <section className="px-4 mt-5">
        <div className="grid grid-cols-3 gap-2">
          {wa ? (
            <ActionButton
              href={wa}
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
            <ActionButton href={tel} icon={<PhoneIcon />} label="Llamar" />
          ) : (
            <ActionButton disabled icon={<PhoneIcon />} label="Llamar" />
          )}
          {maps ? (
            <ActionButton href={maps} external icon={<MapIcon />} label="Llegar" />
          ) : (
            <ActionButton disabled icon={<MapIcon />} label="Sin direccion" />
          )}
        </div>
      </section>

      {/* Descripcion */}
      {n.descripcion && (
        <section className="px-4 mt-6">
          <h2 className="text-base font-bold mb-2">Acerca de</h2>
          <p className="text-[14px] leading-relaxed text-foreground/80 whitespace-pre-line">
            {n.descripcion}
          </p>
        </section>
      )}

      {/* Horarios */}
      <section className="px-4 mt-6">
        <h2 className="text-base font-bold mb-2">Horarios</h2>
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
                    : `${fmtHora(h.abre)} – ${fmtHora(h.cierra)}`}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Ubicacion */}
      {(n.direccion || n.zona_cobertura) && (
        <section className="px-4 mt-6">
          <h2 className="text-base font-bold mb-2">Ubicacion</h2>
          <div className="rounded-2xl bg-secondary/60 p-4 text-[14px]">
            {n.direccion && (
              <p>
                📍 {n.direccion}
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
                Ver en Google Maps →
              </a>
            )}
          </div>
        </section>
      )}

      {/* Galeria */}
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

      {/* Resenas */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold">Resenas</h2>
          {ratingPromedio && (
            <span className="text-sm font-semibold">
              ⭐ {ratingPromedio}{" "}
              <span className="text-muted-foreground font-normal">
                · {resenas.length}
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
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{r.nombre_autor}</p>
                  <span className="text-xs font-semibold">
                    {"⭐".repeat(Math.max(1, Math.min(5, r.calificacion)))}
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
      </section>

      {/* Footer info */}
      <section className="px-4 mt-8 pb-6 text-center text-[11px] text-muted-foreground">
        En LinaresYa desde{" "}
        {new Date(n.creado_en).toLocaleDateString("es-CL", {
          month: "long",
          year: "numeric",
          timeZone: "America/Santiago",
        })}
      </section>
    </main>
  );
}

/* ---------- componentes ---------- */

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

/* ---------- icons ---------- */

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
