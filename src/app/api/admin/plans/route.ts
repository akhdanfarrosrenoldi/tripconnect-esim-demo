import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { handleError, jsonError } from "@/lib/http";
import { planSchema } from "@/lib/schemas";

export async function GET() {
  try {
    if (!(await getAdmin())) return jsonError("UNAUTHORIZED", "Login admin diperlukan.", 401);
    return Response.json(await db.plan.findMany({ include: { destination: true }, orderBy: { createdAt: "desc" } }));
  } catch (error) { return handleError(error); }
}

export async function POST(request: Request) {
  try {
    if (!(await getAdmin())) return jsonError("UNAUTHORIZED", "Login admin diperlukan.", 401);
    const input = planSchema.parse(await request.json());
    const destination = await db.destination.findUnique({ where: { id: input.destinationId } });
    if (!destination) return jsonError("DESTINATION_NOT_FOUND", "Destinasi tidak ditemukan.", 404);
    return Response.json(await db.plan.create({ data: input, include: { destination: true } }), { status: 201 });
  } catch (error) { return handleError(error); }
}
