import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { listUserOrders } from "@/lib/services/orderService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser();
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const orders = await listUserOrders(session.sub, status);
    return ok({ orders });
  } catch (err) {
    return handleApiError(err);
  }
}
