import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getOrderById } from "@/lib/services/orderService";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { OrderCancelButton } from "@/components/site/OrderCancelButton";
import { OrderRetryPaymentButton } from "@/components/site/OrderRetryPaymentButton";
import { formatINR } from "@/lib/utils/pricing";

const CANCELLABLE = ["PENDING", "CONFIRMED", "PROCESSING", "PACKED"];
const RETRYABLE_PAYMENT_STATUSES = ["PENDING", "PAYMENT_FAILED"];

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  const session = await requireUser();

  let order;
  try {
    order = await getOrderById(session.sub, id);
  } catch {
    notFound();
  }

  const needsPayment =
    order.paymentMethod === "RAZORPAY" &&
    order.paymentStatus !== "PAID" &&
    RETRYABLE_PAYMENT_STATUSES.includes(order.orderStatus);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      {success === "1" && (
        <div className="animate-fade-in relative mb-6 flex flex-col items-center gap-2 overflow-hidden rounded-3xl bg-mint-100 p-6 text-center">
          <span className="pointer-events-none absolute left-6 top-4 text-lg motion-safe:animate-heart-pop" style={{ animationDelay: "100ms" }}>
            🎉
          </span>
          <span className="pointer-events-none absolute right-8 top-8 text-lg motion-safe:animate-heart-pop" style={{ animationDelay: "300ms" }}>
            ✨
          </span>
          <span className="pointer-events-none absolute bottom-4 left-12 text-base motion-safe:animate-heart-pop" style={{ animationDelay: "500ms" }}>
            🎈
          </span>
          <CheckCircle2 size={40} className="text-mint-700" />
          <h1 className="font-display text-lg font-bold text-ink-900">Your order has been placed successfully!</h1>
          <p className="text-sm text-ink-500">Estimated delivery: {order.deliveryEstimate || "3-5 business days"}</p>
          <Link
            href="/"
            className="mt-2 inline-flex h-9 items-center justify-center rounded-full bg-mint-600 px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-mint-700"
          >
            Go to Home
          </Link>
        </div>
      )}

      {needsPayment && (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-3xl bg-sun-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle size={22} className="mt-0.5 shrink-0 text-accent-600" />
            <div>
              <p className="font-display font-bold text-ink-900">
                {order.orderStatus === "PAYMENT_FAILED" ? "Payment failed for this order" : "Payment pending"}
              </p>
              <p className="text-sm text-ink-600">Complete your payment of {formatINR(order.total)} to confirm this order.</p>
            </div>
          </div>
          <OrderRetryPaymentButton orderId={order._id.toString()} />
        </div>
      )}

      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900">Order #{order.orderNumber}</h2>
          <p className="text-sm text-ink-400">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
          <h3 className="mb-3 text-sm font-semibold text-ink-800">Order Tracking</h3>
          <OrderTimeline currentStatus={order.orderStatus} />
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
            <h3 className="mb-2 text-sm font-semibold text-ink-800">Delivery Address</h3>
            <p className="text-sm text-ink-600">{order.addressSnapshot.fullName}</p>
            <p className="text-sm text-ink-500">
              {order.addressSnapshot.house}, {order.addressSnapshot.street}
              {order.addressSnapshot.area ? `, ${order.addressSnapshot.area}` : ""}, {order.addressSnapshot.city}, {order.addressSnapshot.state} -{" "}
              {order.addressSnapshot.pincode}
            </p>
            <p className="text-sm text-ink-500">Mobile: {order.addressSnapshot.mobile}</p>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
            <h3 className="mb-2 text-sm font-semibold text-ink-800">Payment</h3>
            <p className="text-sm text-ink-600">Method: {order.paymentMethod}</p>
            <p className="text-sm text-ink-600">Status: {order.paymentStatus}</p>
          </section>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
        <h3 className="mb-3 text-sm font-semibold text-ink-800">Items</h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-ink-50 pb-3 last:border-0 last:pb-0">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                {item.image && <Image src={item.image} alt={item.productName} fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${item.slug}`} className="truncate text-sm font-medium text-ink-800 hover:text-primary-600">
                  {item.productName}
                </Link>
                <p className="text-xs text-ink-400">Qty: {item.quantity}</p>
                {order.orderStatus === "DELIVERED" && (
                  <Link href={`/product/${item.slug}#reviews`} className="text-xs font-semibold text-primary-600 hover:underline">
                    Write a Review
                  </Link>
                )}
              </div>
              <span className="text-sm font-semibold text-ink-800">{formatINR(item.finalPrice)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-dashed border-ink-200 pt-4 text-sm text-ink-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span>Product Discount</span>
              <span>− {formatINR(order.discount)}</span>
            </div>
          )}
          {order.couponDiscount > 0 && (
            <div className="flex justify-between">
              <span>Coupon ({order.couponCode})</span>
              <span>− {formatINR(order.couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{order.shipping === 0 ? "FREE" : formatINR(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-ink-900">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        {CANCELLABLE.includes(order.orderStatus) && <OrderCancelButton orderId={order._id.toString()} />}
        <Link href="/products" className="inline-flex h-9 items-center justify-center rounded-full border border-ink-200 px-4 text-sm font-semibold text-ink-600 hover:bg-ink-50">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
