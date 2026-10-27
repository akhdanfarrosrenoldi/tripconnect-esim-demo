import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { createAdminSession } from "@/lib/auth";
import { handleError, jsonError } from "@/lib/http";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const admin = await db.admin.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!admin || !(await compare(input.password, admin.passwordHash))) {
      return jsonError("INVALID_CREDENTIALS", "Email atau password salah.", 401);
    }
    await createAdminSession(admin.id);
    return Response.json({ id: admin.id, email: admin.email });
  } catch (error) { return handleError(error); }
}
