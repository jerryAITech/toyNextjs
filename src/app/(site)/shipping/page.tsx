import type { Metadata } from "next";
import { Truck, IndianRupee, MapPin, Clock3 } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Delivery timelines, shipping charges and order tracking for ToyStore purchases across India.",
};

const STEPS = ["Ordered", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Shipping Policy" }]} />

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Shipping Policy</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
        We know waiting for a new toy to arrive is the hardest part. Here's exactly how delivery works on ToyStore.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
          <Clock3 size={20} className="mt-0.5 shrink-0 text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold text-ink-800">Delivery Timeline</h3>
            <p className="mt-1 text-sm text-ink-500">
              Most orders are delivered within 3-5 business days of confirmation. The estimated delivery date is shown at checkout and again on
              your order confirmation.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
          <IndianRupee size={20} className="mt-0.5 shrink-0 text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold text-ink-800">Shipping Charges</h3>
            <p className="mt-1 text-sm text-ink-500">
              A flat shipping fee of ₹49 applies per order. Shipping is completely FREE on orders totalling ₹999 or more.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
          <MapPin size={20} className="mt-0.5 shrink-0 text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold text-ink-800">Areas We Serve</h3>
            <p className="mt-1 text-sm text-ink-500">
              We deliver to all serviceable pincodes across India. Pincode serviceability is checked automatically at checkout.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
          <Truck size={20} className="mt-0.5 shrink-0 text-primary-500" />
          <div>
            <h3 className="text-sm font-semibold text-ink-800">Order Tracking</h3>
            <p className="mt-1 text-sm text-ink-500">
              Track any order from My Orders → Order Detail, where a live timeline shows its current stage.
            </p>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">How Tracking Works</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">Every order moves through the following stages, visible on your Order Detail page:</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {STEPS.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">{step}</span>
              {i < STEPS.length - 1 && <span className="text-ink-300">→</span>}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">Possible Delays</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          While we aim to meet the estimated delivery window every time, delivery can occasionally take longer due to:
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-600">
          <li>Festive season demand and courier network congestion.</li>
          <li>Extreme weather conditions affecting transport routes.</li>
          <li>Remote or hard-to-reach pincodes requiring additional transit time.</li>
          <li>Incomplete or incorrect delivery address details.</li>
        </ul>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          If your order is significantly delayed beyond the estimate shown, reach out to our support team and we'll look into it right away.
        </p>
      </section>
    </div>
  );
}
