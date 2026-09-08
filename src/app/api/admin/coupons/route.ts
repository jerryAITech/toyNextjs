import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { couponSchema } from "@/lib/validation/coupon";
import { listCoupons, createCoupon } from "@/lib/services/couponService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET() {
  try {
    await requireAdmin();
    const coupons = await listCoupons();
    return ok({ coupons });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = couponSchema.parse(await req.json());
    const coupon = await createCoupon(body);
    return ok(coupon, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
