import { requireUser } from "@/lib/auth/session";
import { prepareRazorpayRetry, attachRazorpayOrderId } from "@/lib/services/orderService";
import { getRazorpayClient } from "@/lib/razorpay/client";
import { ok, handleApiError, ApiError } from "@/lib/utils/response";
import { rateLimit, clientKeyFromRequest } from "@/lib/utils/rateLimit";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { allowed } = rateLimit(clientKeyFromRequest(req, "checkout"), 10, 60_000);
    if (!allowed) throw new ApiError("Too many attempts. Please try again shortly.", 429);

    const session = await requireUser();
    const { id } = await params;

    const order = await prepareRazorpayRetry(session.sub, id);

    let razorpay: ReturnType<typeof getRazorpayClient>;
    try {
      razorpay = getRazorpayClient();
    } catch {
      throw new ApiError("Online payment is temporarily unavailable. Please contact support.", 503);
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: "INR",
      receipt: `${order.orderNumber}-retry-${Date.now()}`,
      notes: { orderId: order._id.toString() },
    });

    await attachRazorpayOrderId(order._id.toString(), razorpayOrder.id);

    return ok({
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
