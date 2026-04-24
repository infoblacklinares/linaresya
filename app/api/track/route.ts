import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Eventos validos. Mantener sincronizado con el CHECK en estadisticas.sql.
const EVENTOS_VALIDOS = ["vista", "whatsapp", "telefono", "maps"] as const;
type Evento = (typeof EVENTOS_VALIDOS)[number];

// UUID v4-ish: aceptamos cualquier formato canonico de uuid.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { negocio_id?: unknown; evento?: unknown } = {};

  // sendBeacon manda Blob con type "text/plain" o el cliente puede mandar JSON.
  // Soportamos ambos.
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "json invalido" }, { status: 400 });
  }

  const negocioId =
    typeof body.negocio_id === "string" ? body.negocio_id.trim() : "";
  const evento = typeof body.evento === "string" ? body.evento.trim() : "";

  if (!UUID_RE.test(negocioId)) {
    return NextResponse.json({ ok: false, error: "negocio_id invalido" }, { status: 400 });
  }
  if (!EVENTOS_VALIDOS.includes(evento as Evento)) {
    return NextResponse.json({ ok: false, error: "evento invalido" }, { status: 400 });
  }

  const { error } = await supabase.rpc("incrementar_estadistica", {
    p_negocio_id: negocioId,
    p_evento: evento,
  });

  if (error) {
    // No filtramos detalles internos al cliente.
    console.error("[track] rpc error:", error.message);
    return NextResponse.json({ ok: false, error: "rpc fallo" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Health check rapido para debug. GET /api/track devuelve los eventos validos.
export async function GET() {
  return NextResponse.json({ ok: true, eventos: EVENTOS_VALIDOS });
}
