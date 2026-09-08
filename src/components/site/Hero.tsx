import Link from "next/link";
import { DecorativeBlobs } from "@/components/site/DecorativeBlobs";

export function DefaultHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-sun-100">
      <DecorativeBlobs />

      <div className="relative z-10 grid gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-2 lg:items-center lg:px-16 lg:py-20">
        <div className="flex flex-col items-start gap-4 text-left">
          <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-600 shadow-soft">
            Small Toys. Big Dreams.
          </span>
          <h1 className="font-display text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
            Make Playtime <span className="text-primary-600">Magical!</span>
          </h1>
          <p className="max-w-md text-sm text-ink-600 sm:text-base">
            Toys that inspire imagination, creativity &amp; learning.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700"
            >
              Shop Toys
            </Link>
            <Link
              href="#categories"
              className="inline-flex items-center rounded-full border-2 border-primary-500 bg-white px-6 py-3 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
            >
              Explore Categories
            </Link>
          </div>
        </div>

        <div className="relative flex h-56 items-center justify-center sm:h-72 lg:h-80">
          <span className="absolute right-2 top-0 flex items-center gap-1 rounded-full bg-sun-400 px-4 py-2 text-sm font-bold text-ink-900 shadow-soft sm:right-6">
            Up to 50% Off
          </span>

          <span className="animate-float absolute left-2 top-10 text-6xl sm:text-7xl" style={{ animationDelay: "0s" }} aria-hidden>
            🧸
          </span>
          <span className="animate-float absolute right-4 top-20 text-5xl sm:text-6xl" style={{ animationDelay: "0.6s" }} aria-hidden>
            🧩
          </span>
          <span className="animate-float absolute bottom-4 left-10 text-5xl sm:text-6xl" style={{ animationDelay: "1.2s" }} aria-hidden>
            🚗
          </span>
          <span className="animate-float absolute bottom-0 right-12 text-4xl sm:text-5xl" style={{ animationDelay: "1.8s" }} aria-hidden>
            🧱
          </span>
          <span className="animate-float absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-5xl" style={{ animationDelay: "2.4s" }} aria-hidden>
            🎨
          </span>
        </div>
      </div>
    </div>
  );
}
