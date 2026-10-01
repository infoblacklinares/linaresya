import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { verificarNegocio } from "../actions";
import VerificarButton from "./VerificarButton";

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  telefono: string | null;
  direccion: string | null;
  descripcion: string | null;
  categoria_id: number | null;
  a_domicilio: boolean;
  creado_en: string;
};

export default async function VerificacionPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { data, error } = await supabaseAdmin
    .from("negocios")
    .select(
      "id,nombre,slug,telefono,direccion,descripcion,categoria_id,a_domicilio,creado_en",
    )
    .eq("activo", true)
    .eq("verificado", false)
    .order("creado_en", { ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar la cola de verificación: ${error.message}`);
  }

  const negocios = (data ?? []) as Negocio[];

  return (
    <main className="flex-1 mx-auto w-full max-w-3xl pb-10">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link
            href="/admin"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center"
            aria-label="Volver al admin"
          >
            ←
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Operación
            </p>
            <h1 className="text-base font-bold tracking-tight">Cola de verificación</h1>
          </div>
        </div>
      </header>

      <section className="px-4 pt-5">
        <div className="rounded-2xl bg-foreground text-background p-5">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
            Pendientes
          </p>
          <p className="text-3xl font-extrabold mt-1">{negocios.length}</p>
          <p className="text-sm opacity-80 mt-1">
            fichas activas que todavía no han sido verificadas
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <strong>Regla:</strong> verificar no significa corregir datos. Revisa la
          ficha y confirma que corresponde a un negocio real antes de marcarla.
          Si faltan datos, entra a editar primero.
        </div>
      </section>

      <section className="px-4 pt-6">
        {negocios.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <p className="font-bold">No hay fichas pendientes.</p>
            <p className="text-sm text-muted-foreground mt-1">
              La cola de verificación está al día.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {negocios.map((negocio, index) => (
              <article
                key={negocio.id}
                className="rounded-2xl border border-border bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-muted-foreground pt-1 w-5">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-sm">{negocio.nombre}</h2>
                    <div className="mt-2 space-y-1 text-xs">
                      <p>
                        <span className="text-muted-foreground">Teléfono:</span>{" "}
                        {negocio.telefono ?? "Sin teléfono"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Dirección:</span>{" "}
                        {negocio.direccion ??
                          (negocio.a_domicilio ? "Atención a domicilio" : "Sin dirección")}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Descripción:</span>{" "}
                        {negocio.descripcion ?? "Sin descripción"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 ml-8 rounded-xl border border-sky-200 bg-sky-50 p-3">
                  <p className="text-xs font-bold text-sky-950">Evidencia para verificar</p>
                  <p className="mt-1 text-[11px] text-sky-900">
                    Usa estas búsquedas para comprobar identidad, ubicación y presencia
                    pública. La evidencia no marca la ficha automáticamente.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        negocio.nombre + " " + (negocio.direccion ?? "Linares"),
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-sky-300 bg-white px-3 py-1.5 text-[11px] font-bold text-sky-900"
                    >
                      Buscar negocio
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        negocio.nombre + " " + (negocio.direccion ?? "Linares"),
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-sky-300 bg-white px-3 py-1.5 text-[11px] font-bold text-sky-900"
                    >
                      Buscar en Maps
                    </a>
                    {negocio.telefono ? (
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(
                          '"' + negocio.telefono + '" "' + negocio.nombre + '"',
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-sky-300 bg-white px-3 py-1.5 text-[11px] font-bold text-sky-900"
                      >
                        Comprobar teléfono
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 pl-8">
                  <Link
                    href={`/admin/negocio/${negocio.id}/editar`}
                    className="rounded-full bg-foreground text-background text-xs font-bold px-4 py-2"
                  >
                    Revisar ficha
                  </Link>
                  <form action={verificarNegocio}>
                    <input type="hidden" name="id" value={negocio.id} />
                    <VerificarButton />
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
