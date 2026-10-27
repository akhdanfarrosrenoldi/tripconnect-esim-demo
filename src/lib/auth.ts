import { cookies } from "next/headers";
import { hmac, requiredEnv, safeEqual } from "@/lib/crypto";
import { db } from "@/lib/db";

const COOKIE = "tripconnect_admin";
const TTL = 60 * 60 * 12;

export async function createAdminSession(adminId: string) {
  const expires = Math.floor(Date.now() / 1000) + TTL;
  const payload = `${adminId}.${expires}`;
  const signature = hmac(payload, requiredEnv("SESSION_SECRET"));
  (await cookies()).set(COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function getAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  const [id, expiry, signature, extra] = value.split(".");
  if (!id || !expiry || !signature || extra) return null;
  if (Number(expiry) <= Math.floor(Date.now() / 1000)) return null;
  const expected = hmac(`${id}.${expiry}`, requiredEnv("SESSION_SECRET"));
  if (!safeEqual(signature, expected)) return null;
  return db.admin.findUnique({ where: { id }, select: { id: true, email: true } });
}
