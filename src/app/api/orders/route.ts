import { db } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/crypto";
import { handleError, jsonError } from "@/lib/http";
import { orderSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const input = orderSchema.parse(await request.json());
    const plan = await db.plan.findFirst({ where: { id: input.planId, isActive: true, destination: { isActive: true } }, include: { destination: true } });
    if (!plan) return jsonError("PLAN_UNAVAILABLE", "Paket tidak tersedia.", 404);
    const token = randomToken();
    const publicCode = randomToken(12);
    const order = await db.order.create({
      data: {
        publicCode,
        buyerEmail: input.buyerEmail.toLowerCase(),
        planId: plan.id,
        planName: plan.name,
        destinationName: plan.destination.name,
        quotaGb: plan.quotaGb,
        validityDays: plan.validityDays,
        amountIdr: plan.priceIdr,
        paymentSession: { create: { tokenHash: sha256(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000) } },
      },
    });
    return Response.json({ publicCode: order.publicCode, paymentUrl: `/pay/${token}` }, { status: 201 });
  } catch (error) { return handleError(error); }
}
