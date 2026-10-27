import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const jsonError = (code: string, message: string, status: number) =>
  NextResponse.json({ code, message }, { status });

export function handleError(error: unknown) {
  if (error instanceof ZodError) return jsonError("VALIDATION_ERROR", "Data yang dikirim tidak valid.", 400);
  console.error(error);
  return jsonError("INTERNAL_ERROR", "Terjadi kesalahan pada server.", 500);
}
