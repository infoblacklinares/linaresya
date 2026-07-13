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
 * ¿La hora "ahora" cae dentro del rango [abre, cierra)?
 * Maneja horarios que cruzan la medianoche (ej. 20:00 → 02:00).
 * Los tres valores deben venir en el mismo formato de ancho fijo
 * ("HH:MM" o "HH:MM:SS") para comparar lexicográficamente.
 */
export function dentroDeRango(ahora: string, abre: string, cierra: string): boolean {
  if (abre === cierra) return false; // rango vacío / sin definir
  if (cierra > abre) {
    // Horario normal dentro del mismo día
    return ahora >= abre && ahora < cierra;
  }
  // Horario nocturno que cruza medianoche
  return ahora >= abre || ahora < cierra;
}

/**
 * Dado un array de negocio IDs, devuelve cuáles están abiertos ahora mismo.
 * Consulta la tabla `horarios` usando el día y hora actuales en Santiago.
 * Evalúa en JS para soportar horarios que cruzan la medianoche.
 */
export async function getOpenIds(negocioIds: string[]): Promise<string[]> {
  if (!negocioIds.length) return [];
  const dia = diaHoySantiago();
  const ahora = horaAhoraSantiago();
  const { data } = await supabase
    .from("horarios")
    .select("negocio_id, abre, cierra")
    .in("negocio_id", negocioIds)
    .eq("dia", dia)
    .eq("cerrado", false);
  return ((data ?? []) as { negocio_id: string; abre: string | null; cierra: string | null }[])
    .filter((h) => h.abre && h.cierra && dentroDeRango(ahora, h.abre, h.cierra))
    .map((h) => h.negocio_id);
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
