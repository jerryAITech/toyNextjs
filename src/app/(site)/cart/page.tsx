"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Tag, X, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/utils/pricing";
import { ShoppingBag } from "lucide-react";

type ApplicableCoupon = {
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minimumCartValue: number;
  discount: number;
};

export default function CartPage() {
  const { cart, loading, updateItem, removeItem, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [applicableCoupons, setApplicableCoupons] = useState<ApplicableCoupon[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!cart || cart.couponCode || cart.items.length === 0) {
      setApplicableCoupons([]);
      return;
    }
    fetch("/api/cart/coupon")
      .then((r) => r.json())
      .then((json) => setApplicableCoupons(json.data?.coupons ?? []))
      .catch(() => setApplicableCoupons([]));
  }, [cart?.subtotal, cart?.couponCode, cart?.items.length]);

  async function handleApplyCode(code: string) {
    setApplying(true);
    await applyCoupon(code);
    setApplying(false);
    setCouponCode("");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <EmptyState icon={ShoppingBag} title="Your toy box is empty!" description="Browse our collection and add your favorite toys." actionLabel="Explore Toys" actionHref="/products" />
      </div>
    );
  }

  function handleCheckout() {
    router.push("/checkout");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-32 sm:pb-10">
      <h1 className="mb-4 font-display text-xl font-bold text-ink-900 sm:text-2xl">Your Cart ({cart.itemCount})</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-3">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-soft">
              <Link href={`/product/${item.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ink-50 sm:size-24">
                {item.image && <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-semibold text-ink-800 hover:text-primary-600">
                    {item.name}
                  </Link>
                  <button onClick={() => removeItem(item.productId)} aria-label="Remove item" className="shrink-0 text-ink-400 hover:text-danger">
                    <Trash2 size={17} />
                  </button>
                </div>

                {item.unavailable ? (
                  <p className="mt-1 text-xs font-medium text-danger">
                    {item.stock <= 0 ? "Out of stock" : "Unavailable"} — please remove to continue
                  </p>
                ) : (
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-semibold text-ink-900">{formatINR(item.price)}</span>
                    {item.mrp > item.price && <span className="text-xs text-ink-400 line-through">{formatINR(item.mrp)}</span>}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <QuantityStepper
                    size="sm"
                    value={item.quantity}
                    max={item.stock}
                    disabled={item.unavailable}
                    onChange={(q) => updateItem(item.productId, q)}
                  />
                  {!item.unavailable && <span className="text-sm font-semibold text-ink-800">{formatINR(item.lineTotal)}</span>}
                </div>
              </div>
            </div>
          ))}

          <Link href="/products" className="inline-block text-sm font-semibold text-primary-600 hover:underline">
            Continue Shopping
          </Link>
        </div>

        <div className="w-full shrink-0 lg:w-80">
          <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
            <h2 className="mb-3 text-sm font-semibold text-ink-800">Apply Coupon</h2>
            {cart.couponCode ? (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-mint-100 px-3 py-2 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-mint-700">
                  <Tag size={14} /> {cart.couponCode}
                </span>
                <button onClick={removeCoupon} aria-label="Remove coupon">
                  <X size={15} className="text-ink-500" />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-3 flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  <Button size="sm" onClick={() => couponCode.trim() && handleApplyCode(couponCode.trim())} loading={applying}>
                    Apply
                  </Button>
                </div>

                {applicableCoupons.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="flex items-center gap-1 text-xs font-semibold text-ink-500">
                      <Sparkles size={13} className="text-accent-500" /> Coupons you can use
                    </p>
                    {applicableCoupons.map((c) => (
                      <div key={c.code} className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-primary-200 bg-primary-50/60 px-3 py-2">
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 text-sm font-bold text-primary-700">
                            <Tag size={13} /> {c.code}
                          </p>
                          <p className="truncate text-xs text-ink-500">
                            {c.description || (c.type === "PERCENTAGE" ? `${c.value}% off` : `${formatINR(c.value)} off`)} · Save {formatINR(c.discount)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleApplyCode(c.code)}
                          disabled={applying}
                          className="shrink-0 rounded-full bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <h2 className="mb-3 text-sm font-semibold text-ink-800">Price Details</h2>
            <div className="space-y-2 text-sm text-ink-600">
              <Row label="Subtotal" value={formatINR(cart.subtotal)} />
              {cart.productDiscount > 0 && <Row label="Product Discount" value={`− ${formatINR(cart.productDiscount)}`} tone="success" />}
              {cart.couponDiscount > 0 && <Row label="Coupon Discount" value={`− ${formatINR(cart.couponDiscount)}`} tone="success" />}
              <Row label="Delivery" value={cart.shipping === 0 ? "FREE" : formatINR(cart.shipping)} tone={cart.shipping === 0 ? "success" : undefined} />
              <div className="border-t border-dashed border-ink-200 pt-2">
                <Row label="Total" value={formatINR(cart.total)} bold />
              </div>
            </div>

            <Button variant="primary" fullWidth size="lg" className="mt-4" onClick={handleCheckout} disabled={cart.items.some((i) => i.unavailable)}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, tone }: { label: string; value: string; bold?: boolean; tone?: "success" }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold text-ink-900" : ""}`}>
      <span>{label}</span>
      <span className={tone === "success" ? "text-mint-700" : ""}>{value}</span>
    </div>
  );
}
