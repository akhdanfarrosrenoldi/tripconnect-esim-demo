import { PaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { hmac, randomToken, requiredEnv, sha256, safeEqual } from "@/lib/crypto";
import { dispatchFulfillment } from "@/modules/fulfillment/service";

export function signPayment(body: string) {
  return hmac(body, requiredEnv("PAYMENT_WEBHOOK_SECRET"));
}

export function verifyPayment(body: string, signature: string) {
  return safeEqual(signPayment(body), signature);
}

export async function processPaymentEvent(input: { eventId: string; orderId: string; status: "PAID" | "FAILED" }) {
  const existing = await db.paymentEvent.findUnique({ where: { providerEventId: input.eventId } });
  if (existing) return { duplicate: true };
  const callbackToken = input.status === "PAID" ? randomToken() : null;
  let accepted = false;
  try {
    await db.$transaction(async (tx) => {
      const changed = await tx.order.updateMany({
        where: { id: input.orderId, paymentStatus: "PENDING" },
        data: { paymentStatus: input.status as PaymentStatus },
      });
      if (changed.count !== 1) return;
      await tx.paymentEvent.create({ data: { providerEventId: input.eventId, orderId: input.orderId, status: input.status } });
      if (callbackToken) {
        await tx.fulfillment.create({ data: { orderId: input.orderId, callbackToken: sha256(callbackToken) } });
      }
      accepted = true;
    });
  } catch (error) {
    // A competing callback can win the status transition or unique event key.
    const order = await db.order.findUnique({ where: { id: input.orderId } });
    if (order?.paymentStatus !== "PENDING") return { duplicate: true };
    throw error;
  }
  if (accepted && callbackToken) await dispatchFulfillment(input.orderId, callbackToken);
  return { duplicate: !accepted };
}
