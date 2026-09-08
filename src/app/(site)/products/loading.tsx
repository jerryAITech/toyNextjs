import { Skeleton, ProductGridSkeleton } from "@/components/ui/Skeleton";

// Sibling to page.tsx so Next.js can prefetch up to this boundary as soon as an "All Products"
// link enters the viewport (e.g. in the header) — the shell below renders instantly on click
// while the real product data streams in behind it.
export default function Loading() {
  return (
    <div className="px-0 py-6 sm:px-4 xl:mx-auto xl:max-w-[1600px]">
      <Skeleton className="mb-4 ml-4 h-6 w-48 sm:ml-0" />

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-3xl border border-ink-100 bg-white p-4 shadow-soft">
            <Skeleton className="h-64 w-full" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 px-4 sm:px-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
          <ProductGridSkeleton count={20} />
        </div>
      </div>
    </div>
  );
}
