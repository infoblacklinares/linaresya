import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import HistoriaForm from "./HistoriaForm";
import { eliminarHistoria } from "./actions";

export const metadata = {
  title: "Historias - Admin LinaresYa",
  robots: { index: false, follow: false },
};

type HistoriaRow = {
  id: number;
  imagen_url: string;
  texto: string | null;
  creada_en: string;
  expira_en: string;
  negocios: { nombre: string } | { nombre: string }[] | null;
};

export default async function AdminHistoriasPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const [{ data: premium }, { data: historias }] = await Promise.all([
    supabaseAdmin
      .from("negocios")
      .select("id, nombre")
      .eq("activo", true)
      .eq("plan", "premium")
      .order("nombre"),
    supabaseAdmin
      .from("historias")
      .select("id, imagen_url, texto, creada_en, expira_en, negocios:negocio_id(nombre)")
      .gt("expira_en", new Date().toISOString())
      .order("creada_en", { ascending: false }),
  ]);

  const rows = (historias ?? []) as HistoriaRow[];

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/admin" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
        ← Volver al admin
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Historias premium</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Publica historias tipo Instagram para negocios premium. Aparecen arriba en la portada y expiran solas.
      </p>

      {(premium ?? []).length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No hay negocios premium activos todavía.
        </p>
      ) : (
        <HistoriaForm premium={premium ?? []} />
      )}

      <h2 className="mt-8 mb-3 text-lg font-extrabold">Historias activas ({rows.length})</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay historias vigentes.</p>
      ) : (
        <div className="space-y-2">
          {rows.map(h => {
            const neg = Array.isArray(h.negocios) ? h.negocios[0] : h.negocios;
            const horasRestantes = Math.max(0, Math.round((new Date(h.expira_en).getTime() - Date.now()) / 3_600_000));
            return (
              <div key={h.id} className="flex items-center gap-3 rounded-2xl bg-white border border-border p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.imagen_url} alt="" className="h-14 w-14 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{neg?.nombre ?? "—"}</p>
                  {h.texto && <p className="text-xs text-muted-foreground truncate">{h.texto}</p>}
                  <p className="text-[10px] text-muted-foreground mt-0.5">Expira en ~{horasRestantes} h</p>
                </div>
                <form action={eliminarHistoria}>
                  <input type="hidden" name="id" value={h.id} />
                  <button type="submit" className="text-[11px] font-semibold text-rose-600 hover:underline px-2 py-1">
                    Eliminar
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
