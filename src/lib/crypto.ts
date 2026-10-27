import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const randomToken = (bytes = 24) => randomBytes(bytes).toString("hex");
export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
export const hmac = (value: string, secret: string) =>
  createHmac("sha256", secret).update(value).digest("hex");

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}
