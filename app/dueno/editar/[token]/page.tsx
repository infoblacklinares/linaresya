import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import DuenoEditForm from "./DuenoEditForm";

export const metadata = {
  title: "Editar mi negocio - LinaresYa",
  robots: { index: false, follow: false },
};

type Dia =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  a_domicilio: boolean;
  zona_cobertura: string | null;
  disponibilidad: string | null;
  foto_portada: string | null;
  categorias: { slug: string } | null;
};

type Horario = {
  dia: Dia;
  abre: string | null;
  cierra: string | null;
  cerrado: boolean;
};

type FotoGaleria = {
  id: number;
  url: string;
  orden: number;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

export default async function DuenoEditarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Validar token
  const { data: tokenRow } = await supabaseAdmin
    .from("dueno_tokens")
    .select("negocio_id, expira_en")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow) {
    return <TokenInvalidoView reason="Link no encontrado o ya invalido" />;
  }

  const expira = new Date((tokenRow as { expira_en: string }).expira_en);
  if (Date.now() > expira.getTime()) {
    return <TokenInvalidoView reason="El link ya expiró. Solicita uno nuevo." />;
  }

  const negocioId = (tokenRow as { negocio_id: string }).negocio_id;

  // Cargar negocio con todo lo que el dueño puede editar
  const [{ data: negocioData }, { data: horariosData }, { data: fotosData }] =
    await Promise.all([
      supabaseAdmin
        .from("negocios")
        .select(
          "id, nombre, slug, descripcion, telefono, whatsapp, direccion, a_domicilio, zona_cobertura, disponibilidad, foto_portada, categorias:categoria_id(slug)",
        )
        .eq("id", negocioId)
        .single(),
      supabaseAdmin
        .from("horarios")
        .select("dia, abre, cierra, cerrado")
        .eq("negocio_id", negocioId),
      supabaseAdmin
        .from("fotos")
        .select("id, url, orden")
        .eq("negocio_id", negocioId)
        .order("orden", { ascending: true }),
    ]);

  if (!negocioData) notFound();

  // Normalizar la categoria embebida (Supabase a veces la devuelve como array)
  const negocioRaw = negocioData as unknown as Record<string, unknown>;
  const catRaw = negocioRaw.categorias;
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
  const negocio: Negocio = {
    ...(negocioRaw as Omit<Negocio, "categorias">),
    categorias:
      cat && typeof cat === "object"
        ? { slug: String((cat as { slug?: unknown }).slug ?? "") }
        : null,
  };

  const horarios = (horariosData ?? []) as Horario[];
  const fotosGaleria = (fotosData ?? []) as FotoGaleria[];

  const fichaUrl = negocio.categorias
    ? `${SITE_URL}/${negocio.categorias.slug}/${negocio.slug}`
    : SITE_URL;

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl px-4">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border -mx-4 px-4 pt-4 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Editor del dueño
            </p>
            <h1 className="text-lg font-extrabold tracking-tight leading-tight truncate">
              {negocio.nombre}
            </h1>
          </div>
        </div>
      </header>

      <DuenoEditForm
        token={token}
        negocio={negocio}
        horarios={horarios}
        fotosGaleria={fotosGaleria}
        fichaUrl={fichaUrl}
      />
    </main>
  );
}

function TokenInvalidoView({ reason }: { reason: string }) {
  return (
    <main className="flex-1 mx-auto w-full max-w-md px-4 py-12 text-center">
      <div className="text-5xl mb-3">{"⏱️"}</div>
      <h1 className="text-2xl font-extrabold tracking-tight">
        Link no valido
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{reason}</p>
      <Link
        href="/dueno/solicitar"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold px-6 py-3"
      >
        Solicitar nuevo link
      </Link>
    </main>
  );
}
