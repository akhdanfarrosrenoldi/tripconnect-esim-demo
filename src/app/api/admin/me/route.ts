import { getAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export async function GET() {
  const admin = await getAdmin();
  return admin ? Response.json(admin) : jsonError("UNAUTHORIZED", "Login admin diperlukan.", 401);
}
