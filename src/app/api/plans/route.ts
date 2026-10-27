import { db } from "@/lib/db";
import { handleError } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const destination = new URL(request.url).searchParams.get("destination");
    const plans = await db.plan.findMany({
      where: { isActive: true, destination: { isActive: true, ...(destination ? { code: destination } : {}) } },
      include: { destination: true },
      orderBy: [{ priceIdr: "asc" }],
    });
    return Response.json(plans);
  } catch (error) { return handleError(error); }
}
