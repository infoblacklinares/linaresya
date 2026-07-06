import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import EventoForm from "./EventoForm";
import { eliminarEvento } from "./actions";

export const metadata = {
  title: "Eventos - Admin LinaresYa",
  robots: { index: false, follow: false },
};

type EventoRow = {
  id: number;
  titulo: string;
  emoji: string;
  lugar: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  destacado: boolean;
};

function fmtFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", {
    weekday: "short", day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function AdminEventosPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const { data: eventos } = await supabaseAdmin
    .from("eventos")
    .select("id, titulo, emoji, lugar, fecha_inicio, fecha_fin, destacado")
    .gte("fecha_inicio", new Date(Date.now() - 86_400_000).toISOString())
    .order("fecha_inicio");

  const rows = (eventos ?? []) as EventoRow[];

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/admin" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
        ← Volver al admin
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Eventos de Linares</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Ferias, conciertos, actividades municipales. Aparecen en la portada y en /eventos, y desaparecen solos al terminar.
      </p>

      <EventoForm />

      <h2 className="mt-8 mb-3 text-lg font-extrabold">Próximos eventos ({rows.length})</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay eventos programados.</p>
      ) : (
        <div className="space-y-2">
          {rows.map(e => (
            <div key={e.id} className="flex items-center gap-3 rounded-2xl bg-white border border-border p-3">
              <span className="text-2xl shrink-0">{e.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">
                  {e.titulo}
                  {e.destacado && <span className="ml-1.5 text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">⭐ Dest.</span>}
                </p>
                <p className="text-xs text-muted-foreground truncate">📍 {e.lugar}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {fmtFecha(e.fecha_inicio)}{e.fecha_fin ? ` → ${fmtFecha(e.fecha_fin)}` : ""}
                </p>
              </div>
              <form action={eliminarEvento}>
                <input type="hidden" name="id" value={e.id} />
                <button type="submit" className="text-[11px] font-semibold text-rose-600 hover:underline px-2 py-1">
                  Eliminar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
