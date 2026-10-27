import { z } from "zod";
import { db } from "@/lib/db";
import { handleError, jsonError } from "@/lib/http";
import { sha256 } from "@/lib/crypto";

const schema = z.object({
  orderId: z.string().min(1),
  callbackToken: z.string().min(20),
  status: z.enum(["SENT", "ERROR"]),
  emailMessageId: z.string().optional(),
  error: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const fulfillment = await db.fulfillment.findUnique({ where: { orderId: input.orderId } });
    if (!fulfillment || fulfillment.callbackToken !== sha256(input.callbackToken)) {
      return jsonError("UNAUTHORIZED", "Callback tidak sah.", 401);
    }
    if (fulfillment.status === "SENT") return Response.json({ duplicate: true });
    await db.fulfillment.update({
      where: { orderId: input.orderId },
      data: { status: input.status, emailMessageId: input.emailMessageId, error: input.error?.slice(0, 200) },
    });
    return Response.json({ ok: true });
  } catch (error) { return handleError(error); }
}
