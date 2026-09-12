import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { claveLimite, esBot, ipDeCabeceras, mismoOrigen } from "@/lib/peticion";
import { esEventoNegocio, esSesionValida, EVENTOS_HISTORICOS } from "@/lib/eventos";

// Eventos del sitio: no cuelgan de ningun negocio (el popup de la portada se
// ve antes de que exista uno). Sincronizado con eventos_sitio.sql.
const EVENTOS_SITIO = [
  "popup_visto",
  "popup_cerrado",
  "popup_enviado",
  "popup_click",
  "visita_sitio",
  // Se deja para no rechazar beacons de pestanas viejas todavia abiertas.
  "visita_portada",
] as const;
type EventoSitio = (typeof EVENTOS_SITIO)[number];

// UUID v4-ish: aceptamos cualquier formato canonico de uuid.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SALT = process.env.TRACK_SALT ?? "linaresya-track-v1";

export const runtime = "nodejs";

/** Texto corto y sin sorpresas, venga lo que venga en el cuerpo. */
function texto(valor: unknown, max: number): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim().slice(0, max);
  return limpio || null;
}

/**
 * Registro de eventos.
 *
 * Tres puertas antes de contar: user-agent de navegador real, misma
 * procedencia, y un limite por minuto que vive en Postgres (lo unico
 * compartido entre instancias de Vercel).
 *
 * Desde LY-005 el evento se guarda con su hora, su sesion anonima y su origen
 * en `eventos_negocio`, y esa funcion mantiene al dia los contadores diarios
 * de siempre. Si la migracion todavia no se corrio, se cae a las funciones
 * anteriores para no perder nada.
 *
 * Al que no pasa una puerta se le responde ok igual: una metrica no tiene por
 * que explicarle a un script como esquivarla.
 */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent");
  if (esBot(ua)) {
    return NextResponse.json({ ok: true, contado: false });
  }

  const esDesarrollo = process.env.NODE_ENV !== "production";
  if (
    !mismoOrigen({
      origin: req.headers.get("origin"),
      referer: req.headers.get("referer"),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      permitirLocal: esDesarrollo,
    })
  ) {
    return NextResponse.json({ ok: false, error: "origen no permitido" }, { status: 403 });
  }

  let body: {
    negocio_id?: unknown;
    evento?: unknown;
    sesion?: unknown;
    fuente?: unknown;
    datos?: unknown;
  } = {};

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

  const clave = claveLimite(
    ipDeCabeceras({
      xForwardedFor: req.headers.get("x-forwarded-for"),
      xRealIp: req.headers.get("x-real-ip"),
    }),
    SALT,
  );

  // Eventos del sitio: sin negocio_id y con su propia funcion.
  if (EVENTOS_SITIO.includes(evento as EventoSitio)) {
    const { error } = await supabase.rpc("incrementar_evento_sitio", {
      p_evento: evento,
    });
    if (error) {
      // La tabla se crea a mano con supabase/eventos_sitio.sql. Si todavia no
      // se corrio, esto falla: lo logueamos y respondemos ok igual.
      console.error("[track] rpc evento_sitio:", error.message);
    }
    return NextResponse.json({ ok: true });
  }

  if (!UUID_RE.test(negocioId)) {
    return NextResponse.json({ ok: false, error: "negocio_id invalido" }, { status: 400 });
  }
  if (!esEventoNegocio(evento)) {
    return NextResponse.json({ ok: false, error: "evento invalido" }, { status: 400 });
  }

  // Lo que manda el navegador se acota antes de llegar a la base.
  const sesion = esSesionValida(body.sesion) ? (body.sesion as string) : null;
  const fuente = texto(body.fuente, 40);
  const datosCrudos = (body.datos ?? {}) as Record<string, unknown>;
  const datos = {
    utm_source: texto(datosCrudos.utm_source, 40),
    utm_medium: texto(datosCrudos.utm_medium, 40),
    utm_campaign: texto(datosCrudos.utm_campaign, 40),
    utm_content: texto(datosCrudos.utm_content, 40),
    campana: texto(datosCrudos.campana, 40),
    referer_host: texto(datosCrudos.referer_host, 80),
  };

  const registrado = await supabase.rpc("registrar_evento", {
    p_negocio_id: negocioId,
    p_evento: evento,
    p_sesion: sesion,
    p_fuente: fuente,
    p_datos: datos,
    p_clave: clave,
  });

  if (!registrado.error) {
    return NextResponse.json({ ok: true, contado: registrado.data === true });
  }

  const faltaLaTabla = /registrar_evento|does not exist|not find|schema cache/i.test(
    registrado.error.message,
  );
  if (!faltaLaTabla) {
    console.error("[track] rpc registrar_evento:", registrado.error.message);
    return NextResponse.json({ ok: true, contado: false });
  }

  console.warn(
    "[track] Falta registrar_evento: corre supabase/eventos_negocio.sql. " +
      "Mientras tanto solo se cuentan los 4 eventos historicos.",
  );

  // Sin la tabla nueva, los eventos que no existian antes no tienen donde ir.
  if (!EVENTOS_HISTORICOS.includes(evento)) {
    return NextResponse.json({ ok: true, contado: false });
  }

  const limitado = await supabase.rpc("incrementar_estadistica_limitado", {
    p_negocio_id: negocioId,
    p_evento: evento,
    p_clave: clave,
  });
  if (!limitado.error) {
    return NextResponse.json({ ok: true, contado: limitado.data === true });
  }

  const { error } = await supabase.rpc("incrementar_estadistica", {
    p_negocio_id: negocioId,
    p_evento: evento,
  });
  if (error) {
    // Pasa, por ejemplo, con un negocio que ya no existe: la clave foranea lo
    // rechaza. Se loguea y no se devuelve un 500: esto lo llama un beacon.
    console.error("[track] rpc error:", error.message);
    return NextResponse.json({ ok: true, contado: false });
  }
  return NextResponse.json({ ok: true, contado: true });
}

// Health check rapido para debug. GET /api/track devuelve los eventos validos.
export async function GET() {
  return NextResponse.json({
    ok: true,
    eventos_sitio: EVENTOS_SITIO,
  });
}
