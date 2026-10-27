import { db } from "@/lib/db";

export async function dispatchFulfillment(orderId: string, callbackToken: string) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const order = await db.order.findUnique({ where: { id: orderId }, include: { fulfillment: true } });
  if (!order || !order.fulfillment || order.paymentStatus !== "PAID") return;
  if (!webhookUrl) {
    await db.fulfillment.update({ where: { orderId }, data: { status: "ERROR", error: "N8N_WEBHOOK_URL belum dikonfigurasi" } });
    return;
  }
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderId,
        publicCode: order.publicCode,
        buyerEmail: order.buyerEmail,
        planName: order.planName,
        destinationName: order.destinationName,
        fromEmail: process.env.MAIL_FROM ?? "sender@example.com",
        callbackToken,
        callbackUrl: `${process.env.N8N_CALLBACK_BASE_URL ?? process.env.APP_URL ?? "http://localhost:3000"}/api/internal/fulfillment-result`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`n8n returned ${response.status}`);
    await db.fulfillment.updateMany({ where: { orderId, status: "PENDING" }, data: { status: "PROCESSING" } });
  } catch (error) {
    await db.fulfillment.updateMany({
      where: { orderId, status: { in: ["PENDING", "PROCESSING"] } },
      data: { status: "ERROR", error: error instanceof Error ? error.message.slice(0, 200) : "Unknown error" },
    });
  }
}
