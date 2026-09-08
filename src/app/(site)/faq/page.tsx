"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils/cn";

type FaqItem = { question: string; answer: string };
type FaqGroup = { category: string; items: FaqItem[] };

const FAQ_GROUPS: FaqGroup[] = [
  {
    category: "Orders & Payment",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept payments via Razorpay — including UPI, credit/debit cards, netbanking and popular wallets — as well as Cash on Delivery (COD) on eligible orders up to ₹20,000.",
      },
      {
        question: "Is Cash on Delivery available?",
        answer:
          "Yes, COD is available on most orders up to ₹20,000, subject to serviceability at your pincode. If COD isn't available for your order, you'll only see prepaid options at checkout.",
      },
      {
        question: "How do I apply a coupon code?",
        answer:
          "Enter your coupon code in the 'Apply Coupon' field on the cart or checkout page before placing your order. The discount will be reflected in your order total immediately if the code is valid.",
      },
      {
        question: "Can I cancel my order after placing it?",
        answer:
          "Yes — you can cancel from My Orders any time before your order is packed for shipment. Once it moves to Packed, Shipped, Out for Delivery, or Delivered, it can no longer be cancelled online; you can request a return instead once it's delivered. See our Cancellation Policy for details.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        question: "Do you ship across India?",
        answer:
          "Yes, we deliver to all serviceable pincodes across India. Delivery typically takes 3-5 business days, though remote areas may take a little longer.",
      },
      {
        question: "How do I track my order?",
        answer:
          "Go to My Orders and open the order you want to track. The Order Detail page shows a live tracking timeline: Ordered → Confirmed → Packed → Shipped → Out for Delivery → Delivered.",
      },
      {
        question: "How much do you charge for shipping?",
        answer:
          "Shipping is a flat ₹49 per order, and completely FREE on orders above ₹999. Any applicable delivery charge is shown clearly at checkout before you pay.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        question: "What is your return window?",
        answer:
          "You can request a return within 7 days of delivery, provided the item is unused, in its original packaging with tags intact. Visit our Return Policy page for full details and exceptions.",
      },
      {
        question: "How long do refunds take?",
        answer:
          "Once your return is received and approved, refunds are processed within 5-7 business days to your original payment method (or via bank transfer/UPI for COD orders). See our Refund Policy for more.",
      },
    ],
  },
  {
    category: "Product & Safety",
    items: [
      {
        question: "Are your toys safety certified?",
        answer:
          "Every toy listed on ToyStore is checked for age-appropriate materials and safety information, which is displayed on the product page. We work only with brands and manufacturers who meet recognised safety standards.",
      },
      {
        question: "What age groups do your toys cover?",
        answer:
          "Our catalogue is organised into five age groups: 0-2 years, 3-5 years, 6-8 years, 9-12 years, and 13+ years, so you can quickly find toys suited to your child's stage of development.",
      },
      {
        question: "How do I write a product review?",
        answer:
          "You can write a review from the product page once your order for that item has been marked Delivered. This helps keep reviews genuine and useful for other parents.",
      },
    ],
  },
  {
    category: "Account",
    items: [
      {
        question: "Do I need an account to place an order?",
        answer:
          "Yes, creating a free account lets you track orders, save addresses, manage your wishlist and access faster checkout in future.",
      },
      {
        question: "How do I change my password?",
        answer:
          "Go to My Account → Change Password, enter your current password and choose a new one. You'll need at least 8 characters including an uppercase letter and a number.",
      },
    ],
  },
];

export default function FaqPage() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "FAQ" }]} />

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Frequently Asked Questions</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
        Can't find what you're looking for? Reach out to us on our{" "}
        <a href="/contact" className="font-semibold text-primary-600 hover:underline">
          Contact page
        </a>{" "}
        and we'll help you out.
      </p>

      <div className="mt-8 space-y-8">
        {FAQ_GROUPS.map((group) => (
          <section key={group.category}>
            <h2 className="font-display text-lg font-bold text-ink-900">{group.category}</h2>
            <div className="mt-3 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
              {group.items.map((item) => {
                const key = `${group.category}::${item.question}`;
                const isOpen = openKey === key;
                return (
                  <div key={key}>
                    <button
                      type="button"
                      onClick={() => setOpenKey(isOpen ? null : key)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-semibold text-ink-800 hover:bg-ink-50 sm:text-base"
                    >
                      <span>{item.question}</span>
                      <ChevronDown size={18} className={cn("shrink-0 text-ink-400 transition-transform", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && <p className="px-4 pb-4 text-sm leading-relaxed text-ink-500">{item.answer}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
