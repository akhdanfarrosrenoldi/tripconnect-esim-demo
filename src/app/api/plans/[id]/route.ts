import { db } from "@/lib/db";
import { handleError, jsonError } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const plan = await db.plan.findFirst({ where: { id, isActive: true, destination: { isActive: true } }, include: { destination: true } });
    return plan ? Response.json(plan) : jsonError("NOT_FOUND", "Paket tidak ditemukan.", 404);
  } catch (error) { return handleError(error); }
}
