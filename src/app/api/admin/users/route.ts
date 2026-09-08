import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listUsers } from "@/lib/services/userAdminService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const q = req.nextUrl.searchParams.get("q") || undefined;
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const users = await listUsers(q, status);
    return ok({ users });
  } catch (err) {
    return handleApiError(err);
  }
}
