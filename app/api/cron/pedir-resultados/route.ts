import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generarLinkResultados } from "@/lib/dueno-token";
import { sendPedidoResultados } from "@/lib/email";
import { EVENTOS_ACCION, fechaSantiagoDe, type FilaEvento } from "@/lib/eventos";
import {
  negociosAPreguntar,
  periodoAnterior,
  periodoDe,
  periodoLegible,
} from "@/lib/resultados";

/**
 * Le pregunta a cada negocio como le fue el mes que termino (LY-028).
 *
 * Corre el dia 1. A quien le escribe, y por que solo a esos:
 *
 *   - **Con correo cargado.** Hoy son 13 de 164: el resto lo cargo Willson
 *     desde datos publicos y no hay duenno al otro lado. La lista crece sola a
 *     medida que los negocios reclaman su ficha, sin tocar este archivo.
 *   - **Con movimiento el mes pasado.** Preguntarle a alguien que tuvo cero
 *     visitas es pedirle que confirme que no le sirvio de nada. Ese correo
 *     hace dano, no informa.
 *   - **Que no haya respondido ya** ese mes.
 *
 * Nunca revienta: si un correo falla, sigue con el siguiente y lo cuenta.
 */

const ACCIONES = new Set<string>(EVENTOS_ACCION);

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function finDePeriodo(periodo: string): string {
  const anio = Number(periodo.slice(0, 4));
  const mes = Number(periodo.slice(5, 7));
  return mes === 12 ? `${anio + 1}-01-01` : `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const periodo = periodoAnterior(periodoDe());
  const fin = finDePeriodo(periodo);
  const mes = periodoLegible(periodo);

  try {
    const [negociosRes, eventosRes, yaRes] = await Promise.all([
      supabaseAdmin
        .from("negocios")
        .select("id, nombre, email")
        .eq("activo", true)
        .not("email", "is", null),
      supabaseAdmin
        .from("eventos_negocio")
        .select("evento, sesion, fuente, campana, negocio_id, creado_en")
        .gte("creado_en", `${periodo}T00:00:00-04:00`)
        .lt("creado_en", `${fin}T00:00:00-03:00`),
      supabaseAdmin
        .from("resultados_negocio")
        .select("negocio_id")
        .eq("periodo", periodo),
    ]);

    const yaRespondieron = new Set(
      (yaRes.data ?? []).map((r) => String((r as { negocio_id: unknown }).negocio_id)),
    );

    const medidos = new Map<string, { vistas: number; contactos: number }>();
    for (const row of (eventosRes.data ?? []) as FilaEvento[]) {
      const id = row.negocio_id ?? "";
      if (!id) continue;
      const dia = fechaSantiagoDe(row.creado_en);
      if (dia < periodo || dia >= fin) continue;
      const m = medidos.get(id) ?? { vistas: 0, contactos: 0 };
      if (row.evento === "vista") m.vistas++;
      else if (ACCIONES.has(row.evento)) m.contactos++;
      medidos.set(id, m);
    }

    const candidatos = (negociosRes.data ?? []).map((row) => {
      const n = row as { id: string; nombre: string; email: string | null };
      const medido = medidos.get(n.id) ?? { vistas: 0, contactos: 0 };
      return {
        id: n.id,
        nombre: n.nombre,
        email: n.email,
        vistas: medido.vistas,
        contactos: medido.contactos,
        yaReporto: yaRespondieron.has(n.id),
      };
    });

    const aPreguntar = negociosAPreguntar(candidatos);
    const saltados = candidatos.length - aPreguntar.length;
    let enviados = 0;
    let fallidos = 0;

    for (const n of aPreguntar) {
      const linkUrl = await generarLinkResultados(n.id);
      if (!linkUrl) {
        fallidos++;
        continue;
      }

      const ok = await sendPedidoResultados({
        nombre: n.nombre,
        email: n.email ?? "",
        mes,
        vistas: n.vistas,
        contactos: n.contactos,
        linkUrl,
      });
      if (ok) enviados++;
      else fallidos++;
    }

    console.log(
      `[cron pedir-resultados] ${mes}: ${enviados} enviados, ${fallidos} fallidos, ${saltados} saltados`,
    );
    return NextResponse.json({ ok: true, periodo, enviados, fallidos, saltados });
  } catch (err) {
    console.error("[cron pedir-resultados] error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
