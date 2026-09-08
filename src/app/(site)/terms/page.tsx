import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms and conditions governing your use of ToyStore and purchases made on our platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Terms & Conditions" }]} />

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Terms & Conditions</h1>
      <p className="mt-3 text-sm text-ink-500">Last updated: 6 September 2026</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
        These Terms & Conditions govern your use of the ToyStore website and app, and any purchase made through them. By creating an account or
        placing an order with us, you agree to the terms below.
      </p>

      <div className="mt-8 space-y-7">
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">1. Acceptance of Terms</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            By browsing, registering on, or purchasing from ToyStore, you confirm that you accept these Terms & Conditions in full. If you do not
            agree with any part of these terms, please do not use our platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">2. Account Registration</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your
            account. Please provide accurate, current information when registering and keep your saved addresses and contact details up to date.
            Notify us immediately if you suspect unauthorised use of your account.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">3. Order Acceptance</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Placing an order is an offer to purchase. An order is confirmed only once payment is successfully received (for prepaid orders via
            Razorpay) or the order is accepted for Cash on Delivery. We reserve the right to refuse or cancel any order — for example due to
            product unavailability, pricing errors, or suspected fraudulent activity — in which case any amount already charged will be refunded
            in full per our Refund Policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">4. Pricing</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            All prices on ToyStore are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. MRP and
            discounted prices shown at the time of order are final for that order; prices are subject to change without notice for future orders.
            While we make every effort to ensure pricing accuracy, we reserve the right to correct any genuine pricing errors before an order is
            confirmed.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">5. Intellectual Property</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            All content on ToyStore — including the ToyStore name and logo, product photography, descriptions, and site design — is owned by or
            licensed to ToyStore and is protected by applicable intellectual property laws. You may not reproduce, distribute or use this content
            without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">6. Prohibited Uses</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-600">
            <li>Using the platform for any unlawful purpose or in violation of these terms.</li>
            <li>Attempting to gain unauthorised access to our systems, other accounts, or non-public areas of the site.</li>
            <li>Submitting fake reviews, fraudulent orders, or abusing coupon and promotional offers.</li>
            <li>Scraping, copying or reselling product data or content without permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">7. Limitation of Liability</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            ToyStore is not liable for indirect, incidental or consequential damages arising from the use of our platform or products, to the
            fullest extent permitted by law. Our total liability for any claim relating to an order is limited to the amount paid for that order.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">8. Governing Law</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            These Terms & Conditions are governed by the laws of India. Any disputes arising out of or in connection with these terms shall be
            subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">9. Changes to These Terms</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            We may revise these Terms & Conditions from time to time. Continued use of ToyStore after changes are posted constitutes your
            acceptance of the updated terms. We encourage you to review this page periodically.
          </p>
        </section>
      </div>
    </div>
  );
}
