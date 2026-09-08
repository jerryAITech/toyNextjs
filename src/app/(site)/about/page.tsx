import type { Metadata } from "next";
import { ShieldCheck, RotateCcw, CreditCard, Star, Sparkles, Heart, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about ToyStore's mission to bring safe, educational and joyful toys to every home in India.",
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Safety First",
    description: "Every toy we list is screened for age-appropriate materials, non-toxic finishes and choking-hazard warnings before it ever reaches your cart.",
  },
  {
    icon: Sparkles,
    title: "Play With Purpose",
    description: "We curate for developmental value, not just novelty — building blocks, STEM kits and creative sets that grow with your child.",
  },
  {
    icon: Truck,
    title: "Fast, Reliable Delivery",
    description: "Orders are packed with care and delivered across India in 3-5 business days, with live tracking every step of the way.",
  },
  {
    icon: Heart,
    title: "Parent-Approved",
    description: "Our catalogue is shaped by real parent feedback and verified reviews, so you're buying with confidence, not guesswork.",
  },
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Safety Certified",
    description: "Toys are checked against age-group guidelines and safety information is listed on every product page.",
  },
  {
    icon: RotateCcw,
    title: "Easy 7-Day Returns",
    description: "Not the right fit? Return it within 7 days of delivery, hassle-free.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Pay safely via Razorpay (UPI, cards, netbanking, wallets) or choose Cash on Delivery.",
  },
  {
    icon: Star,
    title: "Real Customer Reviews",
    description: "Ratings and reviews are only ever left by customers who've actually received the product.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "About Us" }]} />

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">About ToyStore</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
        ToyStore is a premium online toy destination built for parents who want more than just another marketplace listing. We started with a simple
        idea: buying a toy for your child shouldn't mean scrolling through hundreds of unverified sellers, unclear safety labels and confusing return
        policies. It should feel as joyful as the toy itself.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
        Today, ToyStore brings together educational toys, action figures, dolls, building sets and outdoor play equipment from trusted brands and
        manufacturers — all organised by age group, safety-checked, and backed by a team that actually answers the phone.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900 sm:text-xl">Our Mission</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">
          To make it effortless for every family in India to find toys that are safe, age-appropriate and genuinely fun — delivered quickly, priced
          fairly, and backed by a policy that puts the customer first.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900 sm:text-xl">What We Stand For</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
              <v.icon size={20} className="text-primary-500" />
              <h3 className="mt-2 text-sm font-semibold text-ink-800">{v.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900 sm:text-xl">Why Parents Trust Us</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-ink-50 p-4 sm:grid-cols-4">
          {TRUST_POINTS.map((t) => (
            <div key={t.title} className="flex flex-col items-center gap-1.5 text-center">
              <t.icon size={22} className="text-primary-500" />
              <span className="text-xs font-semibold text-ink-800">{t.title}</span>
              <span className="text-[11px] leading-snug text-ink-500">{t.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900 sm:text-xl">How We're Different</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-600">
          <li>Every listing shows the recommended age group, material and safety information up front — not buried in a PDF.</li>
          <li>We don't just resell anything that's cheap to ship — our catalogue is curated by category specialists, not an open marketplace feed.</li>
          <li>Transparent pricing in INR with clear MRP and discount breakdowns, no last-minute surprise charges at checkout.</li>
          <li>A dedicated support team you can actually reach by phone, email or our contact form — not just a chatbot loop.</li>
        </ul>
      </section>
    </div>
  );
}
