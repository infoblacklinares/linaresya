import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Degrada a plan "basico" los negocios cuyo premium_hasta ya venció.
// Regla: solo se tocan los que TIENEN premium_hasta en el pasado.
// premium_hasta = null => premium permanente/manual, no se toca.

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const ahora = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("negocios")
      .update({ plan: "basico" })
      .eq("plan", "premium")
      .not("premium_hasta", "is", null)
      .lt("premium_hasta", ahora)
      .select("id, nombre, premium_hasta");

    if (error) {
      console.error("[cron expire-premium] update error:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const degradados = (data ?? []) as { id: string; nombre: string; premium_hasta: string }[];
    if (degradados.length > 0) {
      console.log(
        `[cron expire-premium] ${degradados.length} negocio(s) degradado(s) a básico:`,
        degradados.map(n => n.nombre).join(", "),
      );
    }

    return NextResponse.json({
      ok: true,
      degradados: degradados.length,
      negocios: degradados.map(n => ({ nombre: n.nombre, venció: n.premium_hasta })),
    });
  } catch (err) {
    console.error("[cron expire-premium] Error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
