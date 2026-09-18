import { NextRequest } from "next/server";
import { z } from "zod";
import { resolveOwner } from "@/lib/auth/owner";
import { applyCouponToCart, removeCouponFromCart, getApplicableCoupons } from "@/lib/services/cartService";
import { ok, handleApiError } from "@/lib/utils/response";

const applySchema = z.object({ code: z.string().trim().min(3) });

export async function GET() {
  try {
    const owner = await resolveOwner();
    const coupons = await getApplicableCoupons(owner);
    return ok({ coupons });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const owner = await resolveOwner();
    const { code } = applySchema.parse(await req.json());
    const cart = await applyCouponToCart(owner, code);
    return ok(cart);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE() {
  try {
    const owner = await resolveOwner();
    const cart = await removeCouponFromCart(owner);
    return ok(cart);
  } catch (err) {
    return handleApiError(err);
  }
}
