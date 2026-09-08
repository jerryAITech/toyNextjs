import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getOrderById, markOrderPaymentFailed } from "@/lib/services/orderService";
import { ok, handleApiError } from "@/lib/utils/response";

const schema = z.object({ orderId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const { orderId } = schema.parse(await req.json());
    const order = await getOrderById(session.sub, orderId);

    if (order.paymentStatus === "PENDING") {
      await markOrderPaymentFailed(orderId, "Cancelled by customer at checkout");
    }

    return ok({ acknowledged: true });
  } catch (err) {
    return handleApiError(err);
  }
}
