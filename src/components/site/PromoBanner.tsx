import Link from "next/link";

export function PromoBanner() {
  return (
    <div className="relative mx-4 overflow-hidden rounded-3xl bg-gradient-to-br from-sun-100 via-berry-100 to-primary-100 px-6 py-10 text-center shadow-soft sm:mx-0 sm:px-12 sm:py-14 sm:text-left">
      <div className="pointer-events-none absolute -left-6 -top-8 text-6xl opacity-40 sm:text-7xl" aria-hidden>
        🧩
      </div>
      <div className="pointer-events-none absolute -right-2 bottom-2 text-6xl opacity-40 sm:text-8xl" aria-hidden>
        🚗
      </div>
      <div className="pointer-events-none absolute right-1/3 top-4 text-3xl opacity-40 sm:text-4xl" aria-hidden>
        ✨
      </div>

      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-3 sm:mx-0 sm:items-start">
        <h2 className="font-display text-2xl font-extrabold text-ink-900 sm:text-4xl">Learn. Play. Grow.</h2>
        <p className="text-sm text-ink-600 sm:text-base">Educational toys for a brighter future.</p>
        <Link
          href="/category/educational-toys"
          className="mt-2 inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700"
        >
          Shop Educational Toys
        </Link>
      </div>
    </div>
  );
}
