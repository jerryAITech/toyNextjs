import { notFound } from "next/navigation";
import { getCouponById } from "@/lib/services/couponService";
import { CouponForm, type CouponFormValues } from "@/components/admin/CouponForm";

function toDateInputValue(date: unknown): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date as string);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coupon = await getCouponById(id);
  if (!coupon) notFound();

  const initial: Partial<CouponFormValues> = {
    code: coupon.code,
    description: coupon.description || "",
    type: coupon.type as "PERCENTAGE" | "FIXED",
    value: coupon.value,
    minimumCartValue: coupon.minimumCartValue ?? 0,
    maximumDiscount: coupon.maximumDiscount ?? null,
    startDate: toDateInputValue(coupon.startDate),
    endDate: toDateInputValue(coupon.endDate),
    usageLimit: coupon.usageLimit ?? null,
    perUserLimit: coupon.perUserLimit ?? 1,
    firstOrderOnly: coupon.firstOrderOnly ?? false,
    status: coupon.status as "ACTIVE" | "INACTIVE",
  };

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-bold text-ink-900">Edit Coupon</h1>
      <CouponForm couponId={id} initial={initial} />
    </div>
  );
}
