import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { handleError, jsonError } from "@/lib/http";
import { planSchema } from "@/lib/schemas";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getAdmin())) return jsonError("UNAUTHORIZED", "Login admin diperlukan.", 401);
    const { id } = await context.params;
    const input = planSchema.parse(await request.json());
    const existing = await db.plan.findUnique({ where: { id } });
    if (!existing) return jsonError("NOT_FOUND", "Paket tidak ditemukan.", 404);
    return Response.json(await db.plan.update({ where: { id }, data: input, include: { destination: true } }));
  } catch (error) { return handleError(error); }
}
