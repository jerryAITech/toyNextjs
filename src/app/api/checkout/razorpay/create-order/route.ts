import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { createPendingRazorpayOrder, attachRazorpayOrderId } from "@/lib/services/orderService";
import { getRazorpayClient } from "@/lib/razorpay/client";
import { ok, handleApiError, ApiError } from "@/lib/utils/response";
import { rateLimit, clientKeyFromRequest } from "@/lib/utils/rateLimit";

const schema = z.object({ addressId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(clientKeyFromRequest(req, "checkout"), 10, 60_000);
    if (!allowed) throw new ApiError("Too many attempts. Please try again shortly.", 429);

    const session = await requireUser();
    const { addressId } = schema.parse(await req.json());

    let razorpay: ReturnType<typeof getRazorpayClient>;
    try {
      razorpay = getRazorpayClient();
    } catch {
      throw new ApiError("Online payment is temporarily unavailable. Please use Cash on Delivery.", 503);
    }

    const order = await createPendingRazorpayOrder(session.sub, addressId);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: "INR",
      receipt: order.orderNumber,
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
