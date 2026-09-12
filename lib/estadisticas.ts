/**
 * Calculos del panel de estadisticas (LY-027).
 *
 * Todo lo que se pueda probar sin navegador vive aca: rangos de fecha,
 * totales, agregado por negocio y orden. La pagina solo consulta y dibuja.
 *
 * Sin imports a proposito: asi los tests corren con `node --test` sobre este
 * archivo, sin bundler ni alias de rutas.
 *
 * Fuente de datos: `estadisticas_diarias`, que guarda 1 fila por negocio por
 * dia con 4 contadores. Lo que NO se puede calcular con eso, y por eso no
 * aparece en el panel hasta LY-005: visitantes unicos, hora del evento,
 * clicks de Instagram, compartidos y origen de la visita.
 */

// --- Fechas (zona de Chile) ------------------------------------------------

/** YYYY-MM-DD de hoy menos `offsetDias`, en hora de Santiago. */
export function fechaCL(offsetDias = 0): string {
  const d = new Date(Date.now() - offsetDias * 24 * 60 * 60 * 1000);
  // en-CA formatea como YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * DD/MM para los ejes y las tablas.
 *
 * A mano y no con Intl: segun la version de ICU, `es-CL` con month "2-digit"
 * devuelve "12/9" en vez de "12/09", asi que el formato cambiaba entre el
 * servidor y el navegador. Aca la fecha ya viene como YYYY-MM-DD.
 */
export function diaCorto(fechaIso: string): string {
  const [, mes, dia] = fechaIso.split("-");
  if (!mes || !dia) return fechaIso;
  return `${dia}/${mes}`;
}

export function esFechaISO(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const t = Date.parse(`${valor}T12:00:00Z`);
  return !Number.isNaN(t);
}

// --- Rango del filtro ------------------------------------------------------

export type Periodo = "hoy" | "7" | "30" | "rango";

export type Rango = {
  periodo: Periodo;
  desde: string;
  hasta: string;
  /** Cuantos dias cubre, incluidos los extremos. */
  dias: number;
  etiqueta: string;
};

/** Tope de dias que se dibujan, para que un rango absurdo no reviente la pagina. */
export const MAX_DIAS_RANGO = 180;

function diferenciaEnDias(desde: string, hasta: string): number {
  const a = Date.parse(`${desde}T12:00:00Z`);
  const b = Date.parse(`${hasta}T12:00:00Z`);
  return Math.round((b - a) / 86_400_000) + 1;
}

/**
 * Traduce lo que viene en la URL a un rango concreto. Cualquier cosa invalida
 * cae en los ultimos 7 dias: el panel nunca queda en blanco por un parametro
 * mal escrito.
 */
export function resolverRango(params: {
  periodo?: string;
  desde?: string;
  hasta?: string;
}): Rango {
  const hoy = fechaCL(0);

  if (params.periodo === "hoy") {
    return { periodo: "hoy", desde: hoy, hasta: hoy, dias: 1, etiqueta: "Hoy" };
  }
  if (params.periodo === "30") {
    return { periodo: "30", desde: fechaCL(29), hasta: hoy, dias: 30, etiqueta: "Ultimos 30 dias" };
  }
  if (params.periodo === "rango") {
    const desdeOk = esFechaISO(params.desde ?? "");
    const hastaOk = esFechaISO(params.hasta ?? "");
    if (desdeOk && hastaOk) {
      // Si los dan al reves, se ordenan en vez de devolver un rango vacio.
      let desde = params.desde as string;
      let hasta = params.hasta as string;
      if (desde > hasta) [desde, hasta] = [hasta, desde];
      let dias = diferenciaEnDias(desde, hasta);
      if (dias > MAX_DIAS_RANGO) {
        dias = MAX_DIAS_RANGO;
        // Se recorta por el inicio: interesa lo mas reciente.
        const limite = new Date(Date.parse(`${hasta}T12:00:00Z`) - (MAX_DIAS_RANGO - 1) * 86_400_000);
        desde = limite.toISOString().slice(0, 10);
      }
      return {
        periodo: "rango",
        desde,
        hasta,
        dias,
        etiqueta: `${diaCorto(desde)} al ${diaCorto(hasta)}`,
      };
    }
  }
  return { periodo: "7", desde: fechaCL(6), hasta: hoy, dias: 7, etiqueta: "Ultimos 7 dias" };
}

/** Todos los dias del rango, en orden, incluidos los que no tienen datos. */
export function diasDelRango(rango: Rango): string[] {
  const dias: string[] = [];
  const inicio = Date.parse(`${rango.desde}T12:00:00Z`);
  for (let i = 0; i < rango.dias; i++) {
    dias.push(new Date(inicio + i * 86_400_000).toISOString().slice(0, 10));
  }
  return dias;
}

// --- Agregados -------------------------------------------------------------

export type FilaDiaria = {
  negocio_id: string;
  fecha: string;
  vistas: number;
  clicks_whatsapp: number;
  clicks_telefono: number;
  clicks_maps: number;
};

export type Totales = {
  vistas: number;
  llamadas: number;
  whatsapp: number;
  maps: number;
  acciones: number;
  /** acciones / vistas en %. Null cuando no hay vistas: no se inventan tasas. */
  tasaAccion: number | null;
};

export function totalesDelRango(filas: FilaDiaria[]): Totales {
  let vistas = 0;
  let llamadas = 0;
  let whatsapp = 0;
  let maps = 0;
  for (const f of filas) {
    vistas += f.vistas;
    llamadas += f.clicks_telefono;
    whatsapp += f.clicks_whatsapp;
    maps += f.clicks_maps;
  }
  const acciones = llamadas + whatsapp + maps;
  return {
    vistas,
    llamadas,
    whatsapp,
    maps,
    acciones,
    tasaAccion: vistas > 0 ? (acciones / vistas) * 100 : null,
  };
}

export type NegocioAgregado = {
  negocio_id: string;
  nombre: string;
  slug: string;
  categoriaSlug: string;
  categoriaNombre: string;
  vistas: number;
  acciones: number;
  llamadas: number;
  whatsapp: number;
  maps: number;
};

export type FilaConNegocio = FilaDiaria & {
  nombre: string;
  slug: string;
  categoriaSlug: string;
  categoriaNombre: string;
};

export function agregarPorNegocio(filas: FilaConNegocio[]): NegocioAgregado[] {
  const mapa = new Map<string, NegocioAgregado>();
  for (const f of filas) {
    const acc = mapa.get(f.negocio_id) ?? {
      negocio_id: f.negocio_id,
      nombre: f.nombre,
      slug: f.slug,
      categoriaSlug: f.categoriaSlug,
      categoriaNombre: f.categoriaNombre,
      vistas: 0,
      acciones: 0,
      llamadas: 0,
      whatsapp: 0,
      maps: 0,
    };
    acc.vistas += f.vistas;
    acc.llamadas += f.clicks_telefono;
    acc.whatsapp += f.clicks_whatsapp;
    acc.maps += f.clicks_maps;
    acc.acciones = acc.llamadas + acc.whatsapp + acc.maps;
    mapa.set(f.negocio_id, acc);
  }
  return Array.from(mapa.values());
}

export type SerieDia = { fecha: string; vistas: number; acciones: number };

export function serieDiaria(filas: FilaDiaria[], dias: string[]): SerieDia[] {
  const mapa = new Map<string, SerieDia>(
    dias.map((fecha) => ({ fecha, vistas: 0, acciones: 0 })).map((d) => [d.fecha, d]),
  );
  for (const f of filas) {
    const dia = mapa.get(f.fecha);
    if (!dia) continue; // fuera del rango dibujado
    dia.vistas += f.vistas;
    dia.acciones += f.clicks_telefono + f.clicks_whatsapp + f.clicks_maps;
  }
  return dias.map((fecha) => mapa.get(fecha) as SerieDia);
}

// --- Orden y busqueda ------------------------------------------------------

export type Orden = "vistas" | "acciones" | "nombre";

export function ordenValido(valor: string | undefined): Orden {
  return valor === "acciones" || valor === "nombre" ? valor : "vistas";
}

export function ordenarNegocios(lista: NegocioAgregado[], orden: Orden): NegocioAgregado[] {
  const copia = [...lista];
  if (orden === "nombre") {
    copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return copia;
  }
  copia.sort((a, b) => {
    const diff = b[orden] - a[orden];
    // Empate: el que tiene mas vistas primero, y si no, alfabetico. Sin esto
    // el orden de los negocios sin actividad cambia entre recargas.
    if (diff !== 0) return diff;
    if (b.vistas !== a.vistas) return b.vistas - a.vistas;
    return a.nombre.localeCompare(b.nombre, "es");
  });
  return copia;
}

/** Busqueda por nombre, sin tildes ni mayusculas. */
export function filtrarPorNombre(
  lista: NegocioAgregado[],
  consulta: string,
): NegocioAgregado[] {
  const q = normalizar(consulta);
  if (!q) return lista;
  return lista.filter((n) => normalizar(n.nombre).includes(q));
}

function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
