import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const COOKIE_SALT = "linaresya-admin-v1";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function expectedToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return crypto.createHash("sha256").update(password + COOKIE_SALT).digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false; // sin password seteado, nadie entra
  const jar = await cookies();
  const c = jar.get(COOKIE_NAME);
  if (!c) return false;
  // comparacion de tiempo constante para evitar timing attacks
  const got = Buffer.from(c.value);
  const want = Buffer.from(expectedToken());
  if (got.length !== want.length) return false;
  return crypto.timingSafeEqual(got, want);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !input) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function setAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
