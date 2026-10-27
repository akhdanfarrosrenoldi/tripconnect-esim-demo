import { db } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function GET() {
  try {
    return Response.json(await db.destination.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }));
  } catch (error) { return handleError(error); }
}
