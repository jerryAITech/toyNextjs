import { Truck, ShieldCheck, RotateCcw, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FEATURES = [
  { icon: Truck, title: "Fast Delivery", desc: "3-5 day delivery across India", tone: "bg-primary-50 text-primary-500", blob: "text-primary-100" },
  { icon: ShieldCheck, title: "Safety Tested", desc: "Certified, child-safe materials", tone: "bg-mint-100 text-mint-600", blob: "text-mint-100" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day hassle-free returns", tone: "bg-sun-100 text-accent-700", blob: "text-sun-100" },
  { icon: Lock, title: "Secure Payments", desc: "Razorpay & Cash on Delivery", tone: "bg-berry-100 text-berry-500", blob: "text-berry-100" },
];

export function TrustFeatures() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:gap-4 sm:px-0">
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className="relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-soft transition-shadow hover:shadow-card sm:flex-row sm:text-left"
        >
          {/* Decorative organic blob peeking from the corner, clipped by the card — same motif as
              DecorativeBlobs, scaled down and tinted to match each card's own accent color. */}
          <svg
            className={cn("pointer-events-none absolute -right-7 -top-9 h-24 w-24", f.blob)}
            viewBox="0 0 200 200"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M44.9,-58.3C57.7,-49.4,67,-34.9,71.3,-19C75.6,-3.1,74.9,14.2,67.8,28.6C60.7,43,47.2,54.5,32.1,62C17,69.5,0.3,73,-16.4,71.3C-33.1,69.6,-49.8,62.7,-60.6,50.1C-71.4,37.5,-76.3,19.2,-76.1,1.2C-75.9,-16.9,-70.6,-33.8,-59.9,-43.4C-49.2,-53,-33.1,-55.3,-18.6,-62.5C-4.1,-69.7,8.8,-81.8,21.9,-79.9C35,-78,44.9,-67.2,44.9,-58.3Z" />
          </svg>

          <div className={cn("relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full", f.tone)}>
            <f.icon size={20} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-ink-800">{f.title}</p>
            <p className="text-xs text-ink-400">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
