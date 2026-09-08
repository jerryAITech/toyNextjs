"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { Quote } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { cn } from "@/lib/utils/cn";

type ReviewItem = {
  _id: string;
  rating: number;
  comment: string;
  userId?: { name?: string } | null;
  productId?: { name?: string; slug?: string } | null;
};

export function CustomerReviews({ reviews }: { reviews: ReviewItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: reviews.length > 1 });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || reviews.length <= 1) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 4500);
    return () => clearInterval(interval);
  }, [emblaApi, reviews.length]);

  if (reviews.length === 0) return null;

  return (
    // w-full at every level below — without it, this carousel's shrink-to-fit box happily
    // resolves to just the width of the (already-capped) card inside it instead of its actual
    // available space, so `mx-auto` on the card had nothing left to center within and it sat
    // flush left with a huge dead gap on the right on any screen wider than the card itself.
    <div className="relative w-full pb-8">
      <div className="w-full overflow-hidden" ref={emblaRef}>
        <div className="flex w-full gap-4">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="min-w-0 flex-[0_0_100%] px-4 sm:flex-[0_0_calc(50%-8px)] sm:px-0 xl:flex-[0_0_calc(33.333%-11px)]"
            >
              <div className="mx-auto flex max-w-2xl flex-col items-center gap-1 rounded-3xl border border-ink-100 bg-white px-6 py-8 text-center shadow-soft sm:flex-row sm:items-start sm:gap-6 sm:px-10 sm:text-left">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-50 font-display text-lg font-bold text-primary-600">
                  {(r.userId?.name || "T")[0].toUpperCase()}
                </div>

                <div className="min-w-0">
                  <Quote size={22} className="mx-auto mb-2 text-primary-200 sm:mx-0" aria-hidden />
                  <p className="text-base leading-relaxed text-ink-700 sm:text-lg">&quot;{r.comment}&quot;</p>

                  <div className="mt-4 flex flex-col items-center gap-1.5 sm:flex-row sm:flex-wrap sm:gap-3">
                    <StarRating rating={r.rating} />
                    <span className="font-semibold text-ink-900">{r.userId?.name || "ToyStore Customer"}</span>
                    {r.productId?.slug && (
                      <>
                        <span className="hidden text-ink-300 sm:inline">·</span>
                        <Link href={`/product/${r.productId.slug}`} className="text-sm text-primary-600 hover:underline">
                          {r.productId.name}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {reviews.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex w-full justify-center">
          {reviews.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to review ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className="flex size-7 items-center justify-center"
            >
              <span className={cn("h-1.5 rounded-full transition-all", i === selected ? "w-5 bg-primary-500" : "w-1.5 bg-ink-200")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
