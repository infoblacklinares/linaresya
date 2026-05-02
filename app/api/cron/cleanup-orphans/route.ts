import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "negocios";
const PREFIX = "uploads"; // PhotoUpload sube a uploads/{ts}-{rand}.ext
const MIN_AGE_MS = 24 * 60 * 60 * 1000; // 24 horas
const MAX_DELETE = 200; // safety: nunca borrar mas de 200 archivos por corrida

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (!supabaseUrl) {
      return NextResponse.json(
        { ok: false, error: "Falta NEXT_PUBLIC_SITE_URL" },
        { status: 500 },
      );
    }

    // 1. Listar TODOS los archivos en uploads/
    // Storage list devuelve hasta 1000 por defecto, paginamos por las dudas.
    const archivos: Array<{ name: string; created_at: string }> = [];
    let offset = 0;
    const PAGE = 200;
    while (true) {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .list(PREFIX, {
          limit: PAGE,
          offset,
          sortBy: { column: "created_at", order: "asc" },
        });
      if (error) {
        return NextResponse.json(
          { ok: false, error: `List error: ${error.message}` },
          { status: 500 },
        );
      }
      if (!data || data.length === 0) break;
      for (const f of data) {
        if (f.name && f.created_at) {
          archivos.push({ name: f.name, created_at: f.created_at });
        }
      }
      if (data.length < PAGE) break;
      offset += PAGE;
    }

    // 2. Recoger TODAS las URLs referenciadas en DB
    const [{ data: negocios }, { data: fotos }] = await Promise.all([
      supabaseAdmin.from("negocios").select("foto_portada"),
      supabaseAdmin.from("fotos").select("url"),
    ]);

    const urlsReferenciadas = new Set<string>();
    for (const n of (negocios ?? []) as Array<{ foto_portada: string | null }>) {
      if (n.foto_portada) urlsReferenciadas.add(n.foto_portada);
    }
    for (const f of (fotos ?? []) as Array<{ url: string }>) {
      if (f.url) urlsReferenciadas.add(f.url);
    }

    // 3. Para cada archivo, calcular su URL publica y chequear si esta referenciada
    const ahora = Date.now();
    const aBorrar: string[] = [];
    let analizados = 0;
    let descartadosPorEdad = 0;
    let descartadosPorReferencia = 0;

    for (const a of archivos) {
      analizados++;
      // Solo borramos archivos con mas de 24hs
      const edad = ahora - new Date(a.created_at).getTime();
      if (edad < MIN_AGE_MS) {
        descartadosPorEdad++;
        continue;
      }
      // Path completo desde la raiz del bucket
      const path = `${PREFIX}/${a.name}`;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
      if (urlsReferenciadas.has(publicUrl)) {
        descartadosPorReferencia++;
        continue;
      }
      aBorrar.push(path);
      if (aBorrar.length >= MAX_DELETE) break;
    }

    // 4. Borrar en batch
    let borrados = 0;
    if (aBorrar.length > 0) {
      const { error: delError } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove(aBorrar);
      if (delError) {
        return NextResponse.json(
          {
            ok: false,
            error: `Delete error: ${delError.message}`,
            stats: { analizados, descartadosPorEdad, descartadosPorReferencia, intentadoBorrar: aBorrar.length },
          },
          { status: 500 },
        );
      }
      borrados = aBorrar.length;
    }

    return NextResponse.json({
      ok: true,
      analizados,
      descartadosPorEdad,
      descartadosPorReferencia,
      borrados,
      total_referencias: urlsReferenciadas.size,
    });
  } catch (err) {
    console.error("[cron cleanup-orphans] Error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
