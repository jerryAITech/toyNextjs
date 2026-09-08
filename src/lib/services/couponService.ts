import { connectDB } from "@/lib/db/connect";
import { CouponModel, type Coupon } from "@/lib/models/Coupon";
import { OrderModel } from "@/lib/models/Order";
import { ApiError } from "@/lib/utils/response";
import type { CouponInput } from "@/lib/validation/coupon";

export type CartLineForCoupon = {
  productId: string;
  categoryId: string;
  price: number;
  quantity: number;
};

export function computeCouponDiscount(coupon: Coupon, lines: CartLineForCoupon[]) {
  const hasProductScope = coupon.applicableProducts && coupon.applicableProducts.length > 0;
  const hasCategoryScope = coupon.applicableCategories && coupon.applicableCategories.length > 0;

  const eligibleLines = lines.filter((line) => {
    if (hasProductScope) return coupon.applicableProducts!.some((p) => p.toString() === line.productId);
    if (hasCategoryScope) return coupon.applicableCategories!.some((c) => c.toString() === line.categoryId);
    return true;
  });

  const eligibleSubtotal = eligibleLines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  if (eligibleSubtotal <= 0) return 0;

  let discount = coupon.type === "PERCENTAGE" ? (eligibleSubtotal * coupon.value) / 100 : coupon.value;

  discount = Math.min(discount, eligibleSubtotal);
  if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);

  return Math.round(discount);
}

export async function validateAndApplyCoupon(
  code: string,
  userId: string | null,
  lines: CartLineForCoupon[],
  cartSubtotal: number
) {
  await connectDB();
  const coupon = await CouponModel.findOne({ code: code.trim().toUpperCase() });

  if (!coupon || coupon.status !== "ACTIVE") throw new ApiError("Invalid or inactive coupon code.", 400);

  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) throw new ApiError("This coupon is not active yet.", 400);
  if (coupon.endDate && now > coupon.endDate) throw new ApiError("This coupon has expired.", 400);

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError("This coupon has reached its usage limit.", 400);
  }

  if (cartSubtotal < coupon.minimumCartValue) {
    throw new ApiError(`Add items worth ₹${coupon.minimumCartValue - cartSubtotal} more to use this coupon.`, 400);
  }

  if (!userId) throw new ApiError("Please log in to apply a coupon.", 401);

  const userUsageCount = await OrderModel.countDocuments({
    userId,
    couponCode: coupon.code,
    orderStatus: { $nin: ["CANCELLED", "PAYMENT_FAILED"] },
  });
  if (userUsageCount >= coupon.perUserLimit) {
    throw new ApiError("You have already used this coupon the maximum number of times.", 400);
  }

  if (coupon.firstOrderOnly) {
    const priorOrders = await OrderModel.countDocuments({
      userId,
      orderStatus: { $nin: ["CANCELLED", "PAYMENT_FAILED"] },
    });
    if (priorOrders > 0) throw new ApiError("This coupon is valid for first-time orders only.", 400);
  }

  const discount = computeCouponDiscount(coupon, lines);
  if (discount <= 0) throw new ApiError("This coupon does not apply to the items in your cart.", 400);

  return { coupon, discount };
}

export async function incrementCouponUsage(code: string) {
  await connectDB();
  await CouponModel.updateOne({ code: code.toUpperCase() }, { $inc: { usedCount: 1 } });
}

export async function listCoupons() {
  await connectDB();
  return CouponModel.find().sort({ createdAt: -1 }).lean();
}

export async function getCouponById(id: string) {
  await connectDB();
  return CouponModel.findById(id).lean();
}

export async function createCoupon(input: CouponInput) {
  await connectDB();
  const existing = await CouponModel.exists({ code: input.code.toUpperCase() });
  if (existing) throw new ApiError("A coupon with this code already exists.", 409);
  return CouponModel.create({
    ...input,
    code: input.code.toUpperCase(),
    startDate: input.startDate || null,
    endDate: input.endDate || null,
  });
}

export async function updateCoupon(id: string, input: Partial<CouponInput>) {
  await connectDB();
  const coupon = await CouponModel.findById(id);
  if (!coupon) throw new ApiError("Coupon not found.", 404);
  Object.assign(coupon, { ...input, code: input.code ? input.code.toUpperCase() : coupon.code });
  await coupon.save();
  return coupon;
}

export async function deleteCoupon(id: string) {
  await connectDB();
  await CouponModel.findByIdAndDelete(id);
}
