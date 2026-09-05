/**
 * Rutas donde el popup de "registra tu negocio" sobra o estorba: el
 * formulario al que lleva, el panel, la edicion del dueno, la ficha para
 * imprimir QR y la pagina offline.
 *
 * Vive aca y no dentro del popup porque el contador de visitas usa la misma
 * lista: el denominador del embudo tiene que ser exactamente el universo
 * donde el popup podia aparecer. Si las dos listas se separan, el porcentaje
 * de conversion pasa a comparar cosas distintas sin que nadie se entere.
 */
export const RUTAS_SIN_POPUP = ["/publicar", "/admin", "/dueno", "/qr", "/offline"];

export function rutaSinPopup(pathname: string): boolean {
  return RUTAS_SIN_POPUP.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}
