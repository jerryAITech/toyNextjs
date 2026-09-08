import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getDashboardStats, resolveDateRange } from "@/lib/services/dashboardService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const range = req.nextUrl.searchParams.get("range") || "30d";
    const from = req.nextUrl.searchParams.get("from") || undefined;
    const to = req.nextUrl.searchParams.get("to") || undefined;

    const { start, end } = resolveDateRange(range, from, to);
    const stats = await getDashboardStats(start, end);
    return ok(stats);
  } catch (err) {
    return handleApiError(err);
  }
}
