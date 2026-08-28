import Link from "next/link";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verificarAccionAdmin } from "@/lib/admin-link";
import AprobarForm from "./AprobarForm";

export const metadata: Metadata = {
  title: "Aprobar negocio",
  robots: { index: false, follow: false },
};

/**
 * Aprobar desde el correo, sin abrir el panel ni iniciar sesion. La pagina
 * solo muestra: aprobar es un POST con boton, porque los escaneadores de
 * correo abren los enlaces solos y aprobarian negocios sin que nadie los vea.
 */
export default async function AprobarPorLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const verificado = verificarAccionAdmin(token);

  if (!verificado.ok) {
    return (
      <Marco titulo={verificado.motivo === "vencido" ? "El link venció" : "Link inválido"}>
        <p className="text-sm text-[#6B5E57]">
          {verificado.motivo === "vencido"
            ? "Los links de aprobación duran 7 días. Entrá al panel para aprobarlo a mano."
            : "No pudimos verificar este link. Entrá al panel para aprobarlo a mano."}
        </p>
        <Link
          href="/admin"
          className="mt-5 inline-flex rounded-full bg-[#1A1410] px-6 py-3 text-sm font-bold text-white"
        >
          Ir al panel
        </Link>
      </Marco>
    );
  }

  const { data: negocio } = await supabaseAdmin
    .from("negocios")
    .select("nombre, activo, telefono, whatsapp, direccion, descripcion, categorias:categoria_id(nombre, emoji)")
    .eq("id", verificado.negocioId)
    .single();

  if (!negocio) {
    return (
      <Marco titulo="Ese negocio ya no existe">
        <p className="text-sm text-[#6B5E57]">
          Puede que lo hayas eliminado desde el panel.
        </p>
      </Marco>
    );
  }

  const n = negocio as Record<string, unknown>;
  const catRaw = n.categorias;
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
  const categoria = cat && typeof cat === "object" ? (cat as Record<string, unknown>) : null;

  if (n.activo) {
    return (
      <Marco titulo="Ya estaba aprobado">
        <p className="text-sm text-[#6B5E57]">
          <strong>{String(n.nombre ?? "")}</strong> ya está publicado en LinaresYa.
        </p>
        <Link
          href="/admin"
          className="mt-5 inline-flex rounded-full bg-[#1A1410] px-6 py-3 text-sm font-bold text-white"
        >
          Ir al panel
        </Link>
      </Marco>
    );
  }

  const datos: Array<[string, string]> = [];
  if (categoria) datos.push(["Categoría", `${String(categoria.emoji ?? "")} ${String(categoria.nombre ?? "")}`]);
  if (n.telefono) datos.push(["Teléfono", String(n.telefono)]);
  if (n.whatsapp) datos.push(["WhatsApp", `+${String(n.whatsapp)}`]);
  if (n.direccion) datos.push(["Dirección", String(n.direccion)]);
  if (n.descripcion) datos.push(["Descripción", String(n.descripcion)]);

  return (
    <Marco titulo={String(n.nombre ?? "")}>
      <p className="text-sm text-[#6B5E57]">
        Está pendiente de revisión. Revisá los datos y aprobalo si están bien.
      </p>

      {datos.length > 0 && (
        <dl className="mt-4 divide-y divide-[#F0EDE8] rounded-2xl border border-[#E8E4DE] bg-white text-left">
          {datos.map(([k, v]) => (
            <div key={k} className="flex gap-3 px-4 py-2.5">
              <dt className="w-24 shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#8E8279]">
                {k}
              </dt>
              <dd className="flex-1 text-sm text-[#1A1410]">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <AprobarForm token={token} />

      <Link
        href="/admin"
        className="mt-4 inline-flex text-sm font-semibold text-[#2B6E80] hover:underline"
      >
        Prefiero revisarlo en el panel →
      </Link>
    </Marco>
  );
}

function Marco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <main className="flex-1 mx-auto w-full max-w-md px-4 py-12 text-center">
      <h1 className="text-2xl font-black tracking-tight text-[#1A1410]">{titulo}</h1>
      <div className="mt-3">{children}</div>
    </main>
  );
}
