/**
 * Planes y capacidades (LY-024 / LY-025).
 *
 * Antes cada pantalla preguntaba `negocio.plan === "premium"` por su cuenta, en
 * diez archivos. Eso tiene dos problemas: para mover que incluye cada plan hay
 * que editar diez pantallas, y un negocio con el premium vencido seguia
 * mostrandose como Premium hasta que corriera el cron de las 07:00.
 *
 * Aca se separan las dos preguntas:
 *   - `planVigente(negocio)`  que plan tiene HOY, mirando la fecha de vencimiento.
 *   - `canUseFeature(negocio, feature)`  si ese plan habilita esa funcion.
 *
 * Cambiar la oferta comercial es cambiar la tabla FEATURES de este archivo.
 */

export type Plan = "basico" | "premium";

/**
 * Funciones que hoy dependen del plan. Solo se listan las que la aplicacion
 * usa de verdad: agregar una que nadie consulta es configuracion muerta.
 * Cuando entren productos (LY-009) y las ofertas pasen a ser de pago (LY-012),
 * se agregan aca.
 */
export type Feature =
  | "whatsapp"
  | "destacado"
  | "estadisticas"
  | "galeria"
  | "ofertas";

/**
 * Que plan habilita cada funcion. Refleja **como funciona hoy el sitio**, no
 * la lista de deseos del plan comercial:
 *   - whatsapp y destacado ya son exclusivos de Premium.
 *   - estadisticas, galeria y ofertas hoy las tiene cualquier negocio. El plan
 *     comercial dice que estadisticas deberia ser de Premium; eso es una
 *     decision de Willson, no un detalle tecnico, y cuando la tome se cambia
 *     esta tabla y nada mas.
 */
const FEATURES: Record<Feature, Plan[]> = {
  whatsapp: ["premium"],
  destacado: ["premium"],
  estadisticas: ["basico", "premium"],
  galeria: ["basico", "premium"],
  ofertas: ["basico", "premium"],
};

/**
 * Lo minimo que hay que saber de un negocio para decidir su plan.
 *
 * `premium_hasta` es opcional a proposito: varias consultas traen solo `plan`
 * (las tarjetas del listado, por ejemplo). Si no viene, se confia en el plan
 * guardado; si viene, manda la fecha.
 */
export type NegocioConPlan = {
  plan: string | null;
  premium_hasta?: string | null;
};

/**
 * El plan que corre hoy. Un Premium con `premium_hasta` en el pasado cuenta
 * como Basico desde el minuto que vence, sin esperar al cron
 * (`/api/cron/expire-premium`, 07:00), que es el que lo escribe en la base.
 *
 * `premium_hasta = null` es Premium sin vencimiento: asi lo deja el panel
 * cuando el admin no pone fecha.
 */
export function planVigente(negocio: NegocioConPlan): Plan {
  if (negocio.plan !== "premium") return "basico";
  if (negocio.premium_hasta === undefined) return "premium";
  if (negocio.premium_hasta === null) return "premium";
  const hasta = new Date(negocio.premium_hasta);
  if (Number.isNaN(hasta.getTime())) return "premium";
  return hasta.getTime() >= Date.now() ? "premium" : "basico";
}

/** Atajo para lo mas consultado: si el negocio corre como Premium hoy. */
export function esPremium(negocio: NegocioConPlan): boolean {
  return planVigente(negocio) === "premium";
}

/** Si el plan vigente del negocio habilita esa funcion. */
export function canUseFeature(negocio: NegocioConPlan, feature: Feature): boolean {
  return FEATURES[feature].includes(planVigente(negocio));
}

/**
 * Fecha (ISO) para vencer un Premium dentro de N dias. La usa el boton de
 * "Premium 30 dias" del panel, para no tener que escribir la fecha a mano.
 */
export function vencimientoEnDias(dias: number): string {
  return new Date(Date.now() + dias * 86_400_000).toISOString();
}
