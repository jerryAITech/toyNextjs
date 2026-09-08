import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { PaymentModel } from "@/lib/models/Payment";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const status = req.nextUrl.searchParams.get("status");
    const method = req.nextUrl.searchParams.get("method");

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;
    if (method && method !== "all") filter.method = method;

    const payments = await PaymentModel.find(filter)
      .sort({ createdAt: -1 })
      .populate("orderId", "orderNumber")
      .populate("userId", "name email")
      .lean();

    return ok({ payments });
  } catch (err) {
    return handleApiError(err);
  }
}
