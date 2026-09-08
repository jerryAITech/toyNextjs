"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function HorizontalScroller({
  children,
  className,
  showArrows,
}: {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    if (!showArrows) return;
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [showArrows, updateArrows]);

  function scrollByPage(dir: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: dir * scrollerRef.current.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className={cn("flex gap-3 overflow-x-auto no-scrollbar snap-x-mandatory scroll-pl-4 scroll-pr-4", className)}
      >
        {/* Explicit spacer elements (not container padding — Safari ignores trailing padding on a
            scrollable row) hold the actual gutter space, and scroll-pl/pr tells CSS scroll-snap to
            treat that space as part of the snap alignment. Without the scroll-padding, snap-start on
            the cards only knows about the cards themselves, so any swipe snaps the first/last card
            flush against the edge and permanently discards the gutter after the very first scroll. */}
        <div className="w-4 shrink-0 sm:hidden" aria-hidden="true" />
        {children}
        <div className="w-4 shrink-0 sm:hidden" aria-hidden="true" />
      </div>

      {showArrows && canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByPage(-1)}
          className="absolute left-1 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-600 shadow-lifted hover:bg-ink-50 sm:flex"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {showArrows && canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByPage(1)}
          className="absolute right-1 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-600 shadow-lifted hover:bg-ink-50 sm:flex"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}

export function ProductScrollerItem({ children }: { children: React.ReactNode }) {
  // 5 cards per row at sm:+ (one full row on web) — width math matches HorizontalScroller's own
  // gap-3 (12px): (100% - 4 gaps) / 5 columns.
  return <div className="w-[42vw] shrink-0 snap-start sm:w-[calc(20%-9.6px)]">{children}</div>;
}

export function CategoryScrollerItem({ children }: { children: React.ReactNode }) {
  // 5 cards per row at sm:+, same gap-3 math: (100% - 4 gaps) / 5 columns.
  return <div className="w-[38vw] shrink-0 snap-start sm:w-[calc(20%-9.6px)]">{children}</div>;
}
