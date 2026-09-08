import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listAllOrdersForAdmin } from "@/lib/services/orderService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const paymentMethod = req.nextUrl.searchParams.get("paymentMethod") || undefined;
    const q = req.nextUrl.searchParams.get("q") || undefined;
    const orders = await listAllOrdersForAdmin({ status, paymentMethod, q });
    return ok({ orders });
  } catch (err) {
    return handleApiError(err);
  }
}
