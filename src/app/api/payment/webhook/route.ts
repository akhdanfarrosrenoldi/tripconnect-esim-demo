import { z } from "zod";
import { handleError, jsonError } from "@/lib/http";
import { processPaymentEvent, verifyPayment } from "@/modules/payments/service";

const schema = z.object({ eventId: z.string().uuid(), orderId: z.string().min(1), status: z.enum(["PAID", "FAILED"]) });

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (!verifyPayment(raw, request.headers.get("x-payment-signature") ?? "")) {
      return jsonError("INVALID_SIGNATURE", "Callback tidak sah.", 401);
    }
    const input = schema.parse(JSON.parse(raw));
    return Response.json(await processPaymentEvent(input));
  } catch (error) { return handleError(error); }
}
