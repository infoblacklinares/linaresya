"use client";

import { useEffect, useRef } from "react";
import { enviarEvento } from "@/lib/tracking-cliente";

/**
 * Registra la vista de una ficha (LY-005).
 *
 * Antes la vista se contaba en el servidor, al renderizar. Se movio al
 * navegador por dos razones: en el servidor no existe la sesion, asi que no se
 * podia distinguir una persona de diez recargas; y cualquier cosa que pidiera
 * el HTML contaba como visita, incluidos los scripts que no ejecutan JS.
 *
 * Consecuencia honesta: desde este cambio hay **menos** vistas que antes, y son
 * mas reales. No se comparan con los numeros de agosto.
 */
export default function RegistrarVista({ negocioId }: { negocioId: string }) {
  const enviado = useRef(false);

  useEffect(() => {
    // React puede montar dos veces en desarrollo; el guard evita duplicar.
    if (enviado.current) return;
    enviado.current = true;
    enviarEvento(negocioId, "vista");
  }, [negocioId]);

  return null;
}
