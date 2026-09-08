import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ToyStore collects, uses and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-ink-500">Last updated: 6 September 2026</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
        At ToyStore, we know you're trusting us with information about your family, not just your shopping cart. This policy explains what we
        collect, why we collect it, and how we keep it safe.
      </p>

      <div className="mt-8 space-y-7">
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">1. Information We Collect</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-600">
            <li>Account details: your name, email address and mobile number.</li>
            <li>Delivery information: shipping addresses saved to your account.</li>
            <li>Order history: products purchased, order status and payment method used.</li>
            <li>Support communications: messages you send us via the Contact form, email or phone.</li>
            <li>Usage data: pages visited and general device/browser information, used to keep the site working smoothly.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">2. How We Use Your Information</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">We use your information solely to run and improve ToyStore, including to:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-600">
            <li>Process and deliver your orders, and keep you updated on order status.</li>
            <li>Maintain your account, wishlist and saved addresses.</li>
            <li>Respond to support requests and resolve issues with orders, returns or refunds.</li>
            <li>Send order-related notifications and, where you've opted in, occasional offers.</li>
          </ul>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            We do not sell, rent or trade your personal information to third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">3. Payment Information</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            All online payments are processed securely by Razorpay, our payment gateway partner. ToyStore never sees or stores your full card
            number, CVV or netbanking credentials — these are handled entirely within Razorpay's secure, PCI-DSS compliant systems. For Cash on
            Delivery orders, no online payment details are collected at all.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">4. Cookies</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            We use essential cookies to keep you signed in, remember items in your cart, and understand how our site is used so we can improve it.
            You can control cookies through your browser settings, though some site features may not work correctly if cookies are disabled.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">5. Data Security</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Your password is stored using industry-standard hashing and is never visible to our team, even internally. All data transmitted
            between your browser and ToyStore is encrypted over HTTPS. We limit access to personal data internally to only what's needed to
            fulfil orders and provide support.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">6. Your Rights</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">You're always in control of your data. You can:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-600">
            <li>View and update your profile, saved addresses and password anytime from My Account and Change Password.</li>
            <li>Request a copy of the personal data we hold about you.</li>
            <li>Request deletion of your account and associated data, subject to our legal obligation to retain order records.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">7. Changes to This Policy</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            We may update this Privacy Policy from time to time to reflect changes in our practices. Material changes will be posted on this page
            with an updated date.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">8. Contact Us</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            For any privacy-related questions or requests, write to us at{" "}
            <a href="mailto:privacy@toystore.dev" className="font-semibold text-primary-600 hover:underline">
              privacy@toystore.dev
            </a>{" "}
            or reach our support team via the{" "}
            <a href="/contact" className="font-semibold text-primary-600 hover:underline">
              Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
