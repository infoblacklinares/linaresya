import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import PublishForm from "@/app/publicar/PublishForm";

export const metadata = {
  title: "Nuevo negocio - Admin LinaresYa",
  robots: { index: false, follow: false },
};

type Categoria = { id: number; nombre: string; slug: string; emoji: string };

export default async function AdminNuevoNegocioPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const { data } = await supabaseAdmin
    .from("categorias")
    .select("id, nombre, slug, emoji")
    .eq("activa", true)
    .order("orden");

  const categorias = (data ?? []) as Categoria[];

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/admin" aria-label="Volver" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-base font-bold tracking-tight">Nuevo negocio (admin)</h1>
        </div>
      </header>

      <div className="px-4 pt-5">
        <p className="rounded-2xl bg-[#2B6E80]/8 border border-[#2B6E80]/20 px-4 py-3 text-sm text-[#1f5268]">
          🛠️ Modo admin: el negocio se crea <strong>activo de inmediato</strong>, sin captcha ni pendiente de revisión.
        </p>
      </div>

      <PublishForm categorias={categorias} esAdmin />
    </main>
  );
}
