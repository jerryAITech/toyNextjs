import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Learn about ToyStore's 7-day return window, eligibility conditions and how to initiate a return.",
};

const ELIGIBLE = [
  "Item is unused, unassembled and in its original condition",
  "Original packaging, box and any brand tags are intact",
  "All accessories, manuals and freebies included in the box are returned",
  "Return is requested within 7 days of delivery",
];

const NOT_ELIGIBLE = [
  "Board games, puzzles or craft kits with broken seals or missing pieces",
  "Soft toys or plush items once unpackaged, for hygiene reasons",
  "Items damaged due to misuse after delivery",
  "Products marked as non-returnable on the product page",
];

export default function ReturnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Return Policy" }]} />

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Return Policy</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
        We want you and your child to love every toy from ToyStore. If something isn't quite right, you can return it within 7 days of delivery
        under the conditions below.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">7-Day Return Window</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Returns must be requested within 7 days of the delivery date shown on your order. Requests made after this window cannot be accepted.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
            <CheckCircle2 size={18} className="text-mint-700" /> Eligible for Return
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-600">
            {ELIGIBLE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
            <XCircle size={18} className="text-danger" /> Not Eligible for Return
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-600">
            {NOT_ELIGIBLE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">How to Initiate a Return</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Go to My Orders, open the relevant Order Detail page, and contact our support team at{" "}
          <a href="mailto:support@toystore.dev" className="font-semibold text-primary-600 hover:underline">
            support@toystore.dev
          </a>{" "}
          with your order number and the reason for return. Our team will confirm eligibility, arrange pickup where available, and guide you
          through the next steps.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">Refunds for Returned Items</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Once your returned item is received and inspected, your refund is processed as per our{" "}
          <a href="/refund" className="font-semibold text-primary-600 hover:underline">
            Refund Policy
          </a>{" "}
          — typically within 5-7 business days of approval.
        </p>
      </section>
    </div>
  );
}
