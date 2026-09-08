import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { couponSchema } from "@/lib/validation/coupon";
import { getCouponById, updateCoupon, deleteCoupon } from "@/lib/services/couponService";
import { ok, fail, handleApiError } from "@/lib/utils/response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const coupon = await getCouponById(id);
    if (!coupon) return fail("Coupon not found.", 404);
    return ok(coupon);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = couponSchema.partial().parse(await req.json());
    const coupon = await updateCoupon(id, body);
    return ok(coupon);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteCoupon(id);
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
