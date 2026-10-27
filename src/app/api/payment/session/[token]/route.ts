import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { sha256 } from "@/lib/crypto";
import { handleError, jsonError } from "@/lib/http";
import { signPayment } from "@/modules/payments/service";

async function getSession(token: string) {
  return db.paymentSession.findUnique({ where: { tokenHash: sha256(token) }, include: { order: true } });
}

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const session = await getSession(token);
    if (!session || session.expiresAt < new Date()) return jsonError("SESSION_EXPIRED", "Sesi pembayaran tidak tersedia.", 404);
    return Response.json({
      planName: session.order.planName,
      destinationName: session.order.destinationName,
      amountIdr: session.order.amountIdr,
      paymentStatus: session.order.paymentStatus,
      publicCode: session.order.publicCode,
    });
  } catch (error) { return handleError(error); }
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const session = await getSession(token);
    if (!session || session.expiresAt < new Date()) return jsonError("SESSION_EXPIRED", "Sesi pembayaran kedaluwarsa.", 404);
    if (session.order.paymentStatus !== "PENDING") return Response.json({ publicCode: session.order.publicCode, status: session.order.paymentStatus });
    const body = await request.json();
    if (body.result !== "PAID" && body.result !== "FAILED") return jsonError("INVALID_RESULT", "Hasil pembayaran tidak valid.", 400);
    const payload = JSON.stringify({ eventId: randomUUID(), orderId: session.orderId, status: body.result });
    const callback = await fetch(`${process.env.APP_URL ?? "http://localhost:3000"}/api/payment/webhook`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-payment-signature": signPayment(payload) },
      body: payload,
      signal: AbortSignal.timeout(15000),
    });
    if (!callback.ok) return jsonError("PAYMENT_CALLBACK_FAILED", "Callback pembayaran gagal.", 502);
    return Response.json({ publicCode: session.order.publicCode, status: body.result });
  } catch (error) { return handleError(error); }
}
