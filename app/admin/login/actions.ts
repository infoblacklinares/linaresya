"use server";

import { redirect } from "next/navigation";
import { setAdminCookie, verifyPassword } from "@/lib/admin-auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD no esta configurado en el servidor." };
  }

  if (!verifyPassword(password)) {
    return { error: "Password incorrecta." };
  }

  await setAdminCookie();
  redirect("/admin");
}
