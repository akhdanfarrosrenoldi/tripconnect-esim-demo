import { db } from "@/lib/db";
import { handleError, jsonError } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params;
    const order = await db.order.findUnique({
      where: { publicCode: code },
      select: {
        publicCode: true, planName: true, destinationName: true, quotaGb: true,
        validityDays: true, amountIdr: true, paymentStatus: true, createdAt: true,
        fulfillment: { select: { status: true } },
      },
    });
    return order ? Response.json(order) : jsonError("NOT_FOUND", "Pesanan tidak ditemukan.", 404);
  } catch (error) { return handleError(error); }
}
