import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "How and when refunds are issued for cancelled orders, returns and failed payments on ToyStore.",
};

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Refund Policy" }]} />

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Refund Policy</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
        This policy explains when a refund is issued, how long it takes, and where the money goes back to.
      </p>

      <div className="mt-8 space-y-7">
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">1. What Triggers a Refund</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-600">
            <li>A return request is approved after inspection (see our Return Policy).</li>
            <li>A prepaid order is cancelled before it is packed for shipment.</li>
            <li>An order is cancelled by our team — for example due to stock unavailability.</li>
            <li>A payment attempt fails after money was deducted, or a duplicate payment is detected.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">2. Refund Timeline</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Once a return is received and approved, or a cancellation is confirmed, refunds are processed within 5-7 business days. Depending on
            your bank or payment provider, it may take a few additional days for the amount to reflect in your account or statement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">3. Refund Method</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-600">
            <li>
              <span className="font-semibold text-ink-800">Prepaid orders (Razorpay):</span> refunded to the original payment method used — UPI,
              card, netbanking or wallet — via Razorpay.
            </li>
            <li>
              <span className="font-semibold text-ink-800">Cash on Delivery orders:</span> since no online payment was made, refunds (for
              approved returns of already-delivered COD orders) are issued via bank transfer or UPI to details collected from you at the time of
              the refund request.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">4. Partial Refunds</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            If only part of an order is cancelled or returned — for example one item out of a multi-item order — the refund is calculated for
            that item only, along with any proportionate discount or coupon adjustment. The remaining items and their delivery continue as normal.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">5. Admin-Initiated Cancellations</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            If ToyStore cancels an order or part of an order — for instance because an item unexpectedly goes out of stock — the full amount
            paid for that item is always refunded in full, with no deductions.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">6. Checking Your Refund Status</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            You can see the payment status of any order on its Order Detail page under My Orders. For further questions about a specific refund,
            contact us at{" "}
            <a href="mailto:support@toystore.dev" className="font-semibold text-primary-600 hover:underline">
              support@toystore.dev
            </a>{" "}
            with your order number.
          </p>
        </section>
      </div>
    </div>
  );
}
