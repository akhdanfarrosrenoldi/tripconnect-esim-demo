import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { handleError, jsonError } from "@/lib/http";

export async function GET() {
  try {
    if (!(await getAdmin())) return jsonError("UNAUTHORIZED", "Login admin diperlukan.", 401);
    return Response.json(await db.order.findMany({
      include: { fulfillment: true }, orderBy: { createdAt: "desc" }, take: 100,
    }));
  } catch (error) { return handleError(error); }
}
