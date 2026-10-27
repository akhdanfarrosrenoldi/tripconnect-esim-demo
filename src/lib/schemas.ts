import { z } from "zod";

export const orderSchema = z.object({
  planId: z.string().min(1),
  buyerEmail: z.email().max(254),
});

export const planSchema = z.object({
  destinationId: z.string().min(1),
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().min(5).max(500),
  quotaGb: z.coerce.number().int().min(1).max(500),
  validityDays: z.coerce.number().int().min(1).max(365),
  priceIdr: z.coerce.number().int().min(1000).max(100000000),
  isActive: z.boolean(),
});

export const destinationSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{2,12}$/, "Kode destinasi 2-12 karakter huruf, angka, atau strip."),
  name: z.string().trim().min(2).max(80),
  emoji: z.string().trim().min(1).max(16),
  isActive: z.boolean(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
