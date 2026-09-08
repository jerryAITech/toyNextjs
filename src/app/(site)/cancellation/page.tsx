import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Check, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: "When and how you can cancel an order on ToyStore, and what happens to your payment.",
};

const FLOW = [
  { label: "Ordered", cancellable: true },
  { label: "Confirmed", cancellable: true },
  { label: "Packed", cancellable: false },
  { label: "Shipped", cancellable: false },
  { label: "Out for Delivery", cancellable: false },
  { label: "Delivered", cancellable: false },
];

export default function CancellationPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Cancellation Policy" }]} />

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Cancellation Policy</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
        Plans change — we get it. Here's exactly when you can cancel an order yourself, and what happens next.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">Cancellation Window</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          You can cancel your order yourself from My Orders any time before it has been packed for shipment. Once your order status changes to
          <span className="font-semibold text-ink-800"> Packed</span>, it has already begun preparation for dispatch and can no longer be
          cancelled online.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {FLOW.map((step, i) => (
            <span key={step.label} className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  step.cancellable ? "bg-mint-100 text-mint-700" : "bg-ink-100 text-ink-500"
                }`}
              >
                {step.cancellable ? <Check size={12} /> : <X size={12} />}
                {step.label}
              </span>
              {i < FLOW.length - 1 && <span className="text-ink-300">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-400">Green = self-cancellable · Grey = self-cancellation no longer available</p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">After the Cancellation Window Closes</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          If your order has already been packed, shipped, is out for delivery, or has been delivered, it can no longer be cancelled directly. If
          you no longer want a delivered item, please request a return instead — see our{" "}
          <a href="/return" className="font-semibold text-primary-600 hover:underline">
            Return Policy
          </a>{" "}
          for eligibility and steps.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">How to Cancel an Order</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-ink-600">
          <li>Go to My Orders and select the order you'd like to cancel.</li>
          <li>On the Order Detail page, tap the Cancel Order button (only shown while the order is still cancellable).</li>
          <li>Confirm your cancellation reason. The order status updates to Cancelled immediately.</li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">What Happens to Your Payment</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-600">
          <li>
            <span className="font-semibold text-ink-800">Cash on Delivery orders:</span> nothing is charged, since payment is only collected at
            the time of delivery.
          </li>
          <li>
            <span className="font-semibold text-ink-800">Prepaid orders (Razorpay):</span> the full amount is refunded to your original payment
            method as per our{" "}
            <a href="/refund" className="font-semibold text-primary-600 hover:underline">
              Refund Policy
            </a>
            , typically within 5-7 business days.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">Cancellations Initiated by ToyStore</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          On rare occasions, we may need to cancel an order ourselves — for example if an item unexpectedly goes out of stock. In every such
          case, any amount already paid is refunded to you in full, with no deductions.
        </p>
      </section>
    </div>
  );
}
