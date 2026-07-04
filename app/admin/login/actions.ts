"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { setAdminCookie, verifyPassword } from "@/lib/admin-auth";

export type LoginState = { error?: string };

// Rate limit de intentos de login por IP: 5 intentos por ventana de 15 min.
// In-memory: en serverless puede haber varias instancias, pero corta el
// grueso de un ataque de fuerza bruta contra la password del admin.
const VENTANA_MS = 15 * 60 * 1000;
const MAX_INTENTOS = 5;
const intentos = new Map<string, number[]>();

function permitido(ip: string): boolean {
  const ahora = Date.now();
  const arr = (intentos.get(ip) ?? []).filter(t => ahora - t < VENTANA_MS);
  if (arr.length >= MAX_INTENTOS) {
    intentos.set(ip, arr);
    return false;
  }
  arr.push(ahora);
  intentos.set(ip, arr);
  // Limpieza básica para que el Map no crezca sin límite
  if (intentos.size > 1000) {
    for (const [k, v] of intentos) {
      if (v.every(t => ahora - t >= VENTANA_MS)) intentos.delete(k);
    }
  }
  return true;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD no esta configurado en el servidor." };
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "desconocida";

  if (!permitido(ip)) {
    return {
      error: "Demasiados intentos. Espera 15 minutos y vuelve a intentar.",
    };
  }

  if (!verifyPassword(password)) {
    return { error: "Password incorrecta." };
  }

  await setAdminCookie();
  redirect("/admin");
}
