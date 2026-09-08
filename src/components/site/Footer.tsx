import Link from "next/link";
import { Logo } from "./Logo";
import { InstagramIcon, FacebookIcon } from "./SocialIcons";

const SOCIAL_LINKS = [
  { label: "Instagram", Icon: InstagramIcon },
  { label: "Facebook", Icon: FacebookIcon },
];

const SECTIONS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Customer",
    links: [
      { label: "My Account", href: "/account" },
      { label: "My Orders", href: "/orders" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Return Policy", href: "/return" },
      { label: "Cancellation Policy", href: "/cancellation" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 bg-ink-900 pb-24 pt-12 text-ink-200 md:pb-8">
      <div className="grid grid-cols-2 gap-8 px-4 sm:grid-cols-3 lg:grid-cols-5 xl:mx-auto xl:max-w-[1600px]">
        <div className="col-span-2 lg:col-span-1">
          <Logo size={30} wordmarkClassName="text-2xl text-white" />
          <p className="mt-3 text-sm text-ink-300">Play. Learn. Grow. Premium toys parents trust, delivered fast.</p>
          <div className="mt-4 flex gap-2">
            {SOCIAL_LINKS.map(({ label, Icon }) => (
              <span
                key={label}
                aria-label={label}
                className="flex size-8 items-center justify-center rounded-full bg-ink-800 text-ink-300 hover:bg-primary-500 hover:text-white"
              >
                <Icon size={16} />
              </span>
            ))}
          </div>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title}>
            {/* h2, not h3 — the footer is used on pages that never use h2 for their own content
                (e.g. /products), which left this skipping straight from the page's h1 to an h3. */}
            <h2 className="font-display text-sm font-semibold text-white">{section.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ink-300 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t border-ink-800 px-4 pt-6 text-center text-xs text-ink-300 xl:mx-auto xl:max-w-[1600px]">
        © {new Date().getFullYear()} ToyStore. All rights reserved.
      </div>
    </footer>
  );
}
