/**
 * lib/horarios.ts
 * Utilidades de horario para determinar si un negocio está abierto ahora.
 * Todas las funciones usan zona horaria America/Santiago (Chile).
 */
import { supabase } from "@/lib/supabase";

export type DiaSemana =
  | "lunes" | "martes" | "miercoles" | "jueves"
  | "viernes" | "sabado" | "domingo";

/** Día de hoy en Santiago, sin tildes (ej. "miercoles", "sabado") */
export function diaHoySantiago(): DiaSemana {
  const fmt = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    weekday: "long",
  });
  const raw = fmt.format(new Date()).toLowerCase();
  const norm = raw.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const dias: DiaSemana[] = [
    "lunes", "martes", "miercoles", "jueves",
    "viernes", "sabado", "domingo",
  ];
  return dias.find((d) => d === norm) ?? "lunes";
}

/** Hora actual en Santiago como "HH:MM:SS" (compatible con columna time de Postgres) */
export function horaAhoraSantiago(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

/**
 * Dado un array de negocio IDs, devuelve cuáles están abiertos ahora mismo.
 * Consulta la tabla `horarios` usando el día y hora actuales en Santiago.
 */
export async function getOpenIds(negocioIds: string[]): Promise<string[]> {
  if (!negocioIds.length) return [];
  const dia = diaHoySantiago();
  const ahora = horaAhoraSantiago();
  const { data } = await supabase
    .from("horarios")
    .select("negocio_id")
    .in("negocio_id", negocioIds)
    .eq("dia", dia)
    .eq("cerrado", false)
    .lte("abre", ahora)
    .gt("cierra", ahora);
  return ((data ?? []) as { negocio_id: string }[]).map((h) => h.negocio_id);
}

/** Comprueba si un negocio_id específico está en el set de abiertos */
export function estaAbierto(negocioId: string, openIds: Set<string>): boolean {
  return openIds.has(negocioId);
}

/** Badge visual: "● Abierto" o "● Cerrado" */
export function badgeAbierto(abierto: boolean): {
  texto: string;
  clases: string;
} {
  return abierto
    ? { texto: "● Abierto", clases: "text-[#3D5A45] bg-[#3D5A45]/10" }
    : { texto: "● Cerrado", clases: "text-[#8E8279] bg-[#8E8279]/10" };
}
