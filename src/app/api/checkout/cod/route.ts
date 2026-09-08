import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { createCodOrder } from "@/lib/services/orderService";
import { ok, handleApiError } from "@/lib/utils/response";
import { rateLimit, clientKeyFromRequest } from "@/lib/utils/rateLimit";
import { ApiError } from "@/lib/utils/response";

const schema = z.object({ addressId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(clientKeyFromRequest(req, "checkout"), 10, 60_000);
    if (!allowed) throw new ApiError("Too many attempts. Please try again shortly.", 429);

    const session = await requireUser();
    const { addressId } = schema.parse(await req.json());
    const order = await createCodOrder(session.sub, addressId);
    return ok({ orderId: order._id, orderNumber: order.orderNumber }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
