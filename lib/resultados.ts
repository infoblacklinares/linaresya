/**
 * Resultados reportados por el negocio (LY-028).
 *
 * El sitio mide vistas y clics. Lo que no puede medir, y es lo unico que el
 * negocio siente, es cuanta de esa gente termino comprando: eso pasa en el
 * local, por telefono o por WhatsApp. Se pregunta y se anota.
 *
 * Este archivo tiene la aritmetica y las validaciones, separadas de la
 * pantalla, para poder probarlas. La regla que gobierna todo:
 *
 *   **reportado no es medido.** Un numero que dio el duenno de memoria no se
 *   presenta nunca junto a uno del sitio sin decir cual es cual.
 */

/** Un mes, como lo guarda la base: primer dia, en hora de Chile. */
export type Periodo = string; // "2026-09-01"

/**
 * El primer dia del mes al que pertenece una fecha, en hora de Chile.
 *
 * Se usa `en-CA` porque devuelve YYYY-MM-DD, y se corta a mano en vez de
 * construir un Date: armar `new Date(anio, mes)` en un servidor en UTC deja el
 * mes anterior cada vez que en Chile todavia no son las 21:00.
 */
export function periodoDe(fecha: Date | string = new Date()): Periodo {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  if (Number.isNaN(d.getTime())) return "";
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  return `${ymd.slice(0, 7)}-01`;
}

/** Solo acepta el primer dia de un mes real. Lo demas no entra a la base. */
export function esPeriodoValido(valor: unknown): valor is Periodo {
  if (typeof valor !== "string") return false;
  if (!/^\d{4}-\d{2}-01$/.test(valor)) return false;
  const mes = Number(valor.slice(5, 7));
  const anio = Number(valor.slice(0, 4));
  return mes >= 1 && mes <= 12 && anio >= 2020 && anio <= 2100;
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "2026-09-01" -> "septiembre 2026". Para leer, no para guardar. */
export function periodoLegible(periodo: Periodo): string {
  if (!esPeriodoValido(periodo)) return periodo;
  return `${MESES[Number(periodo.slice(5, 7)) - 1]} ${periodo.slice(0, 4)}`;
}

/**
 * Los meses que se pueden elegir en el panel, del mas nuevo al mas viejo,
 * **empezando por el mes en curso**.
 *
 * El mes en curso tiene que estar. Willson anota lo que el negocio le dice
 * cuando se lo dice, no a fin de mes; y ofrecer solo meses cerrados dejaba la
 * pantalla sin ningun mes con datos, porque la medicion empezo el 12 de
 * septiembre de 2026. Un mes a medias se corrige despues: el reporte se pisa,
 * no se duplica.
 */
export function mesesRecientes(cuantos = 4, hoy: Date | string = new Date()): Periodo[] {
  const salida: Periodo[] = [];
  let cursor = periodoDe(hoy);
  if (!esPeriodoValido(cursor)) return salida;
  for (let i = 0; i < cuantos; i++) {
    salida.push(cursor);
    cursor = periodoAnterior(cursor);
  }
  return salida;
}

/** El mes anterior a uno dado. Sirve para comparar contra el mes pasado. */
export function periodoAnterior(periodo: Periodo): Periodo {
  if (!esPeriodoValido(periodo)) return periodo;
  const anio = Number(periodo.slice(0, 4));
  const mes = Number(periodo.slice(5, 7));
  return mes === 1
    ? `${anio - 1}-12-01`
    : `${anio}-${String(mes - 1).padStart(2, "0")}-01`;
}

/**
 * Lee un numero que vino de un formulario.
 *
 * Vacio devuelve `null`, no cero: "no supo decirme" y "me dijo que ninguno" son
 * respuestas distintas, y confundirlas arruina el promedio.
 */
export function contarReportado(valor: FormDataEntryValue | null | undefined): number | null {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  if (texto === "") return null;
  if (!/^\d{1,6}$/.test(texto)) return null;
  return Number(texto);
}

/** Recorta la nota a lo que acepta la base, sin reventar el guardado. */
export function limpiarNota(valor: FormDataEntryValue | null | undefined): string | null {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim().slice(0, 500);
  return texto === "" ? null : texto;
}

export type Resultado = {
  negocio_id: string;
  periodo: Periodo;
  consultas: number | null;
  clientes: number | null;
  nota: string | null;
};

/** Lo que el sitio midio para ese negocio en ese mes. */
export type Medido = {
  vistas: number;
  acciones: number;
};

/**
 * De cada 100 personas que tocaron un boton de contacto, cuantas el negocio
 * reconoce como consulta.
 *
 * Puede pasar de 100: alguien guarda el numero y llama al dia siguiente, o
 * llega por el directorio y avisa a un amigo. No se recorta, porque ese exceso
 * es informacion: significa que el sitio genera mas de lo que alcanza a medir.
 * Devuelve null cuando no hay con que dividir o no hay dato reportado.
 */
export function tasaDeRespuesta(medido: Medido, reportado: Resultado): number | null {
  if (reportado.consultas === null) return null;
  if (medido.acciones <= 0) return null;
  return Math.round((reportado.consultas / medido.acciones) * 100);
}

/** De las consultas que reconoce, cuantas terminaron comprando. */
export function tasaDeCierre(reportado: Resultado): number | null {
  if (reportado.clientes === null || reportado.consultas === null) return null;
  if (reportado.consultas <= 0) return null;
  return Math.round((reportado.clientes / reportado.consultas) * 100);
}

/**
 * Un aviso cuando los numeros no se sostienen entre si, para revisarlo con el
 * negocio en vez de guardar algo que despues nadie entiende. No bloquea el
 * guardado: el dato es de el, no nuestro.
 */
export function avisoDeCoherencia(medido: Medido, r: Resultado): string | null {
  if (r.consultas !== null && r.clientes !== null && r.clientes > r.consultas) {
    return "Dice mas clientes que consultas. Puede ser gente que volvio, o un dato mal tomado.";
  }
  if (r.consultas !== null && medido.acciones === 0 && r.consultas > 0) {
    return "Reporta consultas y el sitio no registro ni un clic de contacto ese mes. Revisar si llegaron por otro lado.";
  }
  return null;
}

/** Suma de lo reportado, para la linea de totales del panel. */
export function totalesReportados(filas: Resultado[]): {
  negocios: number;
  consultas: number;
  clientes: number;
  sinDato: number;
} {
  let consultas = 0;
  let clientes = 0;
  let sinDato = 0;
  for (const f of filas) {
    if (f.consultas === null && f.clientes === null) sinDato++;
    consultas += f.consultas ?? 0;
    clientes += f.clientes ?? 0;
  }
  return { negocios: filas.length, consultas, clientes, sinDato };
}

/** Lo minimo que el cron necesita saber de un negocio para decidir. */
export type CandidatoPregunta = {
  id: string;
  email: string | null;
  vistas: number;
  yaReporto: boolean;
};

/**
 * A quien le pregunta el cron mensual, y a quien no.
 *
 * Las tres reglas, en orden de importancia:
 *
 *   1. **Tiene correo.** De 164 negocios, 13 lo tienen: el resto los cargo
 *      Willson desde datos publicos y no hay duenno al otro lado. La lista
 *      crece sola a medida que reclaman su ficha.
 *   2. **Tuvo movimiento.** Escribirle a alguien que tuvo cero visitas es
 *      pedirle que confirme que el directorio no le sirvio. Ese correo hace
 *      dano, no informa.
 *   3. **No respondio todavia** ese mes. Nadie recibe dos veces lo mismo.
 */
export function negociosAPreguntar<T extends CandidatoPregunta>(candidatos: T[]): T[] {
  return candidatos.filter((c) => Boolean(c.email) && c.vistas > 0 && !c.yaReporto);
}
