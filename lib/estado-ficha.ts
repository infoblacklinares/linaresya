import { telefonoInternacional, whatsAppLink } from "@/lib/contacto";

export type EstadoFicha = "VERDE" | "AMARILLO" | "ROJO";

export type HorarioFicha = {
  dia: string;
  abre: string | null;
  cierra: string | null;
  cerrado: boolean;
};

/** Determina si existen los siete días y cada fila tiene datos coherentes. */
export function horariosFichaCompletos(horarios: HorarioFicha[]): boolean {
  const dias = new Set<string>();
  for (const horario of horarios) {
    dias.add(horario.dia);
    if (
      (horario.cerrado && (horario.abre !== null || horario.cierra !== null)) ||
      (!horario.cerrado && (!horario.abre || !horario.cierra))
    ) {
      return false;
    }
  }
  return dias.size === 7;
}

export type FichaCalidadInput = {
  activo: boolean;
  verificado: boolean;
  descripcion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  /** Indica si al menos uno de los contactos guardados puede generar un contacto utilizable. */
  contactoUtilizable?: boolean;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  a_domicilio: boolean;
  direccionGenerica?: boolean;
  categoriaId: number | null;
  tieneFotografias: boolean;
  tieneHorariosCompletos: boolean;
};

export function contactoFichaUtilizable(telefono: string | null, whatsapp: string | null): boolean {
  return Boolean(
    (telefono && telefonoInternacional(telefono)) ||
    (whatsapp && whatsAppLink(whatsapp))
  );
}

export type HallazgoFicha = {
  severity: "LOW" | "MEDIUM" | "HIGH";
  rule: string;
  message: string;
};

export type EstadoFichaResult = {
  estado: EstadoFicha;
  faltantes: string[];
  hallazgos: HallazgoFicha[];
  hallazgosHigh: HallazgoFicha[];
  problemasCriticos: string[];
};

/**
 * Fuente única de verdad para el estado operativo de una ficha.
 *
 * La función no consulta Supabase ni modifica datos: recibe el estado actual
 * de la ficha y los hallazgos externos y devuelve un resultado determinista.
 *
 * VERDE: activa, verificada, sin problemas críticos ni faltantes.
 * AMARILLO: operativa, pero con observaciones corregibles.
 * ROJO: existe un bloqueo/crítico (inactiva, no verificada, ubicación crítica
 * o hallazgo HIGH del Data Auditor).
 *
 * El Data Auditor complementa las reglas internas; nunca desactiva las
 * comprobaciones propias de LinaresYa.
 */
export function calcularEstadoFicha(
  ficha: FichaCalidadInput,
  hallazgos: HallazgoFicha[] = [],
): EstadoFichaResult {
  const faltantes: string[] = [];
  const problemasCriticos: string[] = [];

  if (!ficha.descripcion) faltantes.push("Falta descripción");
  if (!ficha.telefono && !ficha.whatsapp) {
    faltantes.push("Falta teléfono/WhatsApp");
  } else if (ficha.contactoUtilizable === false) {
    faltantes.push("Contacto no utilizable");
  }
  if (!ficha.direccion && !ficha.a_domicilio) {
    faltantes.push("Falta dirección");
  }
  if (ficha.lat == null || ficha.lng == null) {
    faltantes.push("Faltan coordenadas");
  }
  if (ficha.direccionGenerica) {
    faltantes.push("Ubicación demasiado genérica");
  }
  if (!ficha.categoriaId) faltantes.push("Falta categoría");
  if (!ficha.tieneFotografias) faltantes.push("No tiene fotografías");
  if (!ficha.tieneHorariosCompletos) faltantes.push("Faltan horarios");
  if (!ficha.verificado) faltantes.push("Verificación pendiente");

  if (!ficha.activo) problemasCriticos.push("La ficha está inactiva");
  if (!ficha.verificado) problemasCriticos.push("La ficha no está verificada");

  const ubicacionCritica =
    (!ficha.direccion && !ficha.a_domicilio) ||
    ficha.direccionGenerica === true ||
    ficha.lat == null ||
    ficha.lng == null;

  if (ubicacionCritica) {
    problemasCriticos.push("La ubicación está incompleta");
  }

  const hallazgosHigh = hallazgos.filter((hallazgo) => hallazgo.severity === "HIGH");
  if (hallazgosHigh.length > 0) {
    problemasCriticos.push("Existe al menos un hallazgo HIGH del Data Auditor");
  }

  const estado: EstadoFicha =
    problemasCriticos.length > 0
      ? "ROJO"
      : faltantes.length > 0 || hallazgos.length > 0
        ? "AMARILLO"
        : "VERDE";

  return {
    estado,
    faltantes,
    hallazgos,
    hallazgosHigh,
    problemasCriticos,
  };
}


export function prioridadFaltante(faltante: string): "ALTA" | "MEDIA" {
  if (
    faltante === "Falta teléfono/WhatsApp" ||
    faltante === "Contacto no utilizable" ||
    faltante === "Falta dirección" ||
    faltante === "Faltan coordenadas" ||
    faltante === "Ubicación demasiado genérica"
  ) {
    return "ALTA";
  }

  return "MEDIA";
}
