import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { handleError, jsonError } from "@/lib/http";
import { destinationSchema } from "@/lib/schemas";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getAdmin())) return jsonError("UNAUTHORIZED", "Login admin diperlukan.", 401);
    const { id } = await context.params;
    const input = destinationSchema.parse(await request.json());
    if (!(await db.destination.findUnique({ where: { id } }))) {
      return jsonError("NOT_FOUND", "Destinasi tidak ditemukan.", 404);
    }
    const duplicate = await db.destination.findUnique({ where: { code: input.code } });
    if (duplicate && duplicate.id !== id) return jsonError("CODE_EXISTS", "Kode destinasi sudah digunakan.", 409);
    return Response.json(await db.destination.update({ where: { id }, data: input }));
  } catch (error) { return handleError(error); }
}
