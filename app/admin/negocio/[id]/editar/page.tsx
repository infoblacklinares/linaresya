import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import EditForm from "./EditForm";

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  categoria_id: number | null;
  tipo: "negocio" | "independiente";
  plan: "basico" | "premium";
  descripcion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  sitio_web: string | null;
  direccion: string | null;
  a_domicilio: boolean;
  zona_cobertura: string | null;
  disponibilidad: string | null;
  foto_portada: string | null;
  activo: boolean;
  verificado: boolean;
  premium_hasta: string | null;
};

type Categoria = {
  id: number;
  nombre: string;
  emoji: string;
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

type FotoGaleria = {
  id: number;
  url: string;
  orden: number;
};

export default async function EditarNegocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const [
    { data: negocio },
    { data: categorias },
    { data: horariosData },
    { data: fotosData },
  ] = await Promise.all([
    supabaseAdmin
      .from("negocios")
      .select(
        "id,nombre,slug,categoria_id,tipo,plan,descripcion,telefono,whatsapp,email,sitio_web,direccion,a_domicilio,zona_cobertura,disponibilidad,foto_portada,activo,verificado,premium_hasta",
      )
      .eq("id", id)
      .single(),
    supabaseAdmin
      .from("categorias")
      .select("id,nombre,emoji")
      .eq("activa", true)
      .order("nombre", { ascending: true }),
    supabaseAdmin
      .from("horarios")
      .select("dia,abre,cierra,cerrado")
      .eq("negocio_id", id),
    supabaseAdmin
      .from("fotos")
      .select("id,url,orden")
      .eq("negocio_id", id)
      .order("orden", { ascending: true }),
  ]);

  if (!negocio) {
    notFound();
  }

  const n = negocio as Negocio;
  const cats = (categorias ?? []) as Categoria[];
  const horarios = (horariosData ?? []) as Horario[];
  const fotosGaleria = (fotosData ?? []) as FotoGaleria[];

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl px-4">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-border -mx-4 px-4 pt-4 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            aria-label="Volver al admin"
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
              Editando
            </p>
            <h1 className="text-lg font-extrabold tracking-tight leading-tight truncate">
              {n.nombre}
            </h1>
          </div>
          <span
            className={
              "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 " +
              (n.activo
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700")
            }
          >
            {n.activo ? "Activo" : "Pendiente"}
          </span>
        </div>
      </header>

      <EditForm
        negocio={n}
        categorias={cats}
        horarios={horarios}
        fotosGaleria={fotosGaleria}
      />
    </main>
  );
}
