import { NextRequest } from "next/server";
import { z } from "zod";
import { resolveOwner } from "@/lib/auth/owner";
import { getOrderById, confirmRazorpayOrderPayment, markOrderPaymentFailed } from "@/lib/services/orderService";
import { verifyRazorpaySignature } from "@/lib/razorpay/client";
import { ok, fail, handleApiError, ApiError } from "@/lib/utils/response";

const schema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const owner = await resolveOwner();
    const body = schema.parse(await req.json());

    const order = await getOrderById(owner, body.orderId);

    if (order.paymentStatus === "PAID") {
      return ok({ orderId: order._id, orderNumber: order.orderNumber, alreadyProcessed: true });
    }

    if (order.razorpayOrderId !== body.razorpay_order_id) {
      throw new ApiError("This payment does not match the order.", 400);
    }

    const validSignature = verifyRazorpaySignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature);

    if (!validSignature) {
      await markOrderPaymentFailed(order._id.toString(), "Signature verification failed");
      return fail("Payment verification failed. If any amount was deducted, it will be refunded.", 400);
    }

    await confirmRazorpayOrderPayment(
      { ...order, _id: order._id.toString() },
      body.razorpay_payment_id,
      body.razorpay_signature,
      body.razorpay_order_id
    );

    return ok({ orderId: order._id, orderNumber: order.orderNumber });
  } catch (err) {
    return handleApiError(err);
  }
}
