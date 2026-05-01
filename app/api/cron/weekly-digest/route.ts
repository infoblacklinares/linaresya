import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendWeeklyDigest, type WeeklyDigestData } from "@/lib/email";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

// Vercel Cron lo invoca con header: Authorization: Bearer <CRON_SECRET>
// Validamos esto para que nadie mas pueda dispararlo.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.warn("[cron] CRON_SECRET no esta configurado");
    return false;
  }
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const ahora = new Date();
    const haceSiete = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const isoSiete = haceSiete.toISOString().slice(0, 10);

    const [
      { count: nuevosNegocios },
      { count: nuevasResenas },
      { count: reportesPendientes },
      { count: pendientesAprobacion },
      { data: stats7d },
    ] = await Promise.all([
      supabaseAdmin
        .from("negocios")
        .select("id", { count: "exact", head: true })
        .eq("activo", true)
        .gte("creado_en", isoSiete),
      supabaseAdmin
        .from("resenas")
        .select("id", { count: "exact", head: true })
        .gte("creado_en", isoSiete),
      supabaseAdmin
        .from("reportes")
        .select("id", { count: "exact", head: true })
        .eq("resuelto", false),
      supabaseAdmin
        .from("negocios")
        .select("id", { count: "exact", head: true })
        .eq("activo", false),
      supabaseAdmin
        .from("estadisticas_diarias")
        .select(
          "negocio_id, vistas, clicks_whatsapp, clicks_telefono, clicks_maps, negocios:negocio_id(nombre, slug, categorias:categoria_id(slug))",
        )
        .gte("fecha", isoSiete),
    ]);

    type StatNeg = {
      id: string;
      nombre: string;
      fichaUrl: string;
      vistas: number;
      clicks: number;
    };
    const aggMap = new Map<string, StatNeg>();
    let totalVistas = 0;
    let totalClicks = 0;

    for (const row of (stats7d ?? []) as unknown[]) {
      const x = row as Record<string, unknown>;
      const negId = String(x.negocio_id ?? "");
      if (!negId) continue;
      const v = Number(x.vistas ?? 0);
      const c =
        Number(x.clicks_whatsapp ?? 0) +
        Number(x.clicks_telefono ?? 0) +
        Number(x.clicks_maps ?? 0);
      totalVistas += v;
      totalClicks += c;
      const negRaw = (x as { negocios?: unknown }).negocios;
      const neg = Array.isArray(negRaw) ? negRaw[0] : negRaw;
      if (!neg || typeof neg !== "object") continue;
      const slug = String((neg as { slug?: unknown }).slug ?? "");
      const catRaw = (neg as { categorias?: unknown }).categorias;
      const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
      const catSlug =
        cat && typeof cat === "object"
          ? String((cat as { slug?: unknown }).slug ?? "")
          : "";
      const fichaUrl =
        slug && catSlug ? `${SITE_URL}/${catSlug}/${slug}` : SITE_URL;
      const existing = aggMap.get(negId);
      if (existing) {
        existing.vistas += v;
        existing.clicks += c;
      } else {
        aggMap.set(negId, {
          id: negId,
          nombre: String((neg as { nombre?: unknown }).nombre ?? ""),
          fichaUrl,
          vistas: v,
          clicks: c,
        });
      }
    }

    const topVistos = Array.from(aggMap.values())
      .sort((a, b) => b.vistas - a.vistas)
      .slice(0, 5)
      .map((t) => ({
        nombre: t.nombre,
        fichaUrl: t.fichaUrl,
        vistas: t.vistas,
        clicks: t.clicks,
      }));

    const payload: WeeklyDigestData = {
      semanaInicio: haceSiete.toISOString(),
      semanaFin: ahora.toISOString(),
      nuevosNegocios: nuevosNegocios ?? 0,
      nuevasResenas: nuevasResenas ?? 0,
      reportesPendientes: reportesPendientes ?? 0,
      pendientesAprobacion: pendientesAprobacion ?? 0,
      totalVistas,
      totalClicks,
      topVistos,
    };

    const sent = await sendWeeklyDigest(payload);

    return NextResponse.json({
      ok: true,
      sent,
      payload,
    });
  } catch (err) {
    console.error("[cron weekly-digest] Error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
