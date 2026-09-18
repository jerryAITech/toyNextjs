import { NextRequest } from "next/server";
import { z } from "zod";
import { resolveOwner } from "@/lib/auth/owner";
import { createCodOrder, type AddressSource } from "@/lib/services/orderService";
import { addressSchema } from "@/lib/validation/address";
import { ok, handleApiError } from "@/lib/utils/response";
import { rateLimit, clientKeyFromRequest } from "@/lib/utils/rateLimit";
import { ApiError } from "@/lib/utils/response";

const schema = z.object({
  addressId: z.string().min(1).optional(),
  address: addressSchema.omit({ isDefault: true }).optional(),
  guestEmail: z.string().trim().email().max(120).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(clientKeyFromRequest(req, "checkout"), 10, 60_000);
    if (!allowed) throw new ApiError("Too many attempts. Please try again shortly.", 429);

    const owner = await resolveOwner();
    const body = schema.parse(await req.json());

    let source: AddressSource;
    let guestEmail: string | null = null;

    if (owner.userId) {
      if (!body.addressId) throw new ApiError("Please select a delivery address.", 400);
      source = { kind: "saved", addressId: body.addressId };
    } else {
      if (!body.address) throw new ApiError("Please provide a delivery address.", 400);
      if (!body.guestEmail) throw new ApiError("Please provide an email address for order updates.", 400);
      source = { kind: "inline", address: body.address };
      guestEmail = body.guestEmail;
    }

    const order = await createCodOrder(owner, source, guestEmail);
    return ok({ orderId: order._id, orderNumber: order.orderNumber }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
