import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { handleError, jsonError } from "@/lib/http";
import { destinationSchema } from "@/lib/schemas";

export async function GET() {
  try {
    if (!(await getAdmin())) return jsonError("UNAUTHORIZED", "Login admin diperlukan.", 401);
    return Response.json(await db.destination.findMany({ orderBy: { name: "asc" } }));
  } catch (error) { return handleError(error); }
}

export async function POST(request: Request) {
  try {
    if (!(await getAdmin())) return jsonError("UNAUTHORIZED", "Login admin diperlukan.", 401);
    const input = destinationSchema.parse(await request.json());
    if (await db.destination.findUnique({ where: { code: input.code } })) {
      return jsonError("CODE_EXISTS", "Kode destinasi sudah digunakan.", 409);
    }
    return Response.json(await db.destination.create({ data: input }), { status: 201 });
  } catch (error) { return handleError(error); }
}
