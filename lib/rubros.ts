/**
 * Paginas por rubro (LY-034).
 *
 * El problema que resuelven: las categorias del sitio son baldes anchos
 * —gastronomia, belleza, servicios-y-oficios— y **nadie busca eso en Google**.
 * La gente escribe "restaurantes en Linares", "peluquerias en Linares",
 * "veterinaria Linares". Hasta ahora el sitio no tenia ni una pagina apuntando
 * a esas busquedas: `linaresya.cl/restaurantes` daba 404.
 *
 * Cada rubro de esta lista se convierte en una pagina que corre **la misma
 * busqueda que ya usa el buscador**. Eso significa que nadie tiene que cargar
 * un campo nuevo en ningun negocio: la pagina se arma sola con lo que hay, y
 * el dia que se agregue una peluqueria mas, aparece ahi sin tocar codigo.
 *
 * La lista es de terminos de busqueda, no de datos. Agregar un rubro es
 * agregar una linea; si no hay negocios suficientes, la pagina simplemente no
 * existe (ver MINIMO_NEGOCIOS).
 */

export type Rubro = {
  /** Va en la URL: /en-linares/<slug> */
  slug: string;
  /** Titulo y H1. En plural, como se busca. */
  titulo: string;
  /** Lo que se le pasa al buscador. Acepta la sintaxis websearch de Postgres. */
  consulta: string;
  /** Frase que describe el rubro, para la meta description. */
  descripcion: string;
};

/**
 * Cuantos negocios tiene que haber para que la pagina exista.
 *
 * Tres no es un numero al azar: una pagina con uno o dos resultados no le
 * sirve a nadie que la encuentre, y Google la trata como pagina vacia hecha
 * para posicionar. Es mejor no tenerla que tenerla mala.
 */
export const MINIMO_NEGOCIOS = 3;

export const RUBROS: Rubro[] = [
  {
    slug: "restaurantes",
    titulo: "Restaurantes en Linares",
    consulta: "restaurante OR restaurant OR comida OR cocina",
    descripcion: "dónde comer en Linares",
  },
  {
    slug: "peluquerias",
    titulo: "Peluquerías en Linares",
    consulta: "peluqueria OR barberia OR estilista OR salon",
    descripcion: "peluquerías y barberías en Linares",
  },
  {
    slug: "veterinarias",
    titulo: "Veterinarias en Linares",
    consulta: "veterinaria OR veterinario OR mascotas",
    descripcion: "atención veterinaria en Linares",
  },
  {
    slug: "ferreterias",
    titulo: "Ferreterías en Linares",
    consulta: "ferreteria OR construccion OR materiales",
    descripcion: "ferreterías y materiales en Linares",
  },
  {
    slug: "farmacias",
    titulo: "Farmacias en Linares",
    consulta: "farmacia OR medicamentos",
    descripcion: "farmacias en Linares",
  },
  {
    slug: "gimnasios",
    titulo: "Gimnasios en Linares",
    consulta: "gimnasio OR fitness OR entrenamiento",
    descripcion: "gimnasios y entrenamiento en Linares",
  },
  {
    slug: "mecanicos",
    titulo: "Mecánicos y talleres en Linares",
    consulta: "mecanico OR taller OR automotriz OR vulcanizacion",
    descripcion: "talleres mecánicos y automotriz en Linares",
  },
  {
    slug: "panaderias",
    titulo: "Panaderías y pastelerías en Linares",
    consulta: "panaderia OR pasteleria OR amasanderia OR tortas",
    descripcion: "panaderías y pastelerías en Linares",
  },
  {
    slug: "cafeterias",
    titulo: "Cafeterías en Linares",
    consulta: "cafe OR cafeteria OR heladeria",
    descripcion: "cafeterías y heladerías en Linares",
  },
  {
    slug: "abogados",
    titulo: "Abogados en Linares",
    consulta: "abogado OR juridico OR legal",
    descripcion: "abogados y servicios jurídicos en Linares",
  },
  {
    slug: "kinesiologia",
    titulo: "Kinesiología en Linares",
    consulta: "kinesiologia OR kinesiologo OR rehabilitacion",
    descripcion: "kinesiología y rehabilitación en Linares",
  },
  {
    slug: "dentistas",
    titulo: "Dentistas en Linares",
    consulta: "dentista OR dental OR odontologia",
    descripcion: "dentistas y clínicas dentales en Linares",
  },
  {
    slug: "carnicerias",
    titulo: "Carnicerías en Linares",
    consulta: "carniceria OR carnes",
    descripcion: "carnicerías en Linares",
  },
  {
    slug: "jardines-infantiles",
    titulo: "Jardines infantiles en Linares",
    consulta: "jardin OR infantil OR sala cuna OR preescolar",
    descripcion: "jardines infantiles y salas cuna en Linares",
  },
  {
    slug: "contadores",
    titulo: "Contadores en Linares",
    consulta: "contador OR contabilidad OR tributario",
    descripcion: "contadores y servicios contables en Linares",
  },
];

/** El rubro de un slug, o null si no esta en la lista. */
export function rubroPorSlug(slug: string): Rubro | null {
  return RUBROS.find((r) => r.slug === slug) ?? null;
}

/** Si un rubro tiene material suficiente para merecer su pagina. */
export function merecePagina(cantidad: number): boolean {
  return cantidad >= MINIMO_NEGOCIOS;
}

/**
 * Rubros relacionados, para enlazar entre paginas.
 *
 * No es adorno: sin enlaces internos, Google tarda mucho mas en encontrar
 * paginas nuevas, y una pagina a la que no llega ningun link del propio sitio
 * se ve como huerfana. Se toman los vecinos de la lista, en circulo, para que
 * toda pagina reciba enlaces de otras.
 */
export function rubrosRelacionados(slug: string, cuantos = 4): Rubro[] {
  const i = RUBROS.findIndex((r) => r.slug === slug);
  if (i < 0) return RUBROS.slice(0, cuantos);
  const salida: Rubro[] = [];
  for (let k = 1; salida.length < cuantos && k < RUBROS.length; k++) {
    salida.push(RUBROS[(i + k) % RUBROS.length]);
  }
  return salida;
}
