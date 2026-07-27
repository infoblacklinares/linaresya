/**
 * Utilidades de distancia para la funcion "Cerca de mi".
 * Las coordenadas de los negocios vienen de la geocodificacion (ver
 * scripts/geocodificar.mjs). La ubicacion del usuario la entrega el
 * navegador y NUNCA se envia a nuestros servidores: todo el calculo
 * ocurre en el cliente.
 */

export type Punto = { lat: number; lng: number };

/** Distancia en kilometros entre dos puntos (formula de Haversine). */
export function distanciaKm(a: Punto, b: Punto): number {
  const R = 6371; // radio terrestre en km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Formato legible: "350 m" / "1,2 km" */
export function formatoDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 100) * 10} m`;
  if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}
