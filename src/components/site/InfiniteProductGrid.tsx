"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils/cn";

export function InfiniteProductGrid({
  initialItems,
  initialPage,
  totalPages,
  baseParams,
  className,
}: {
  initialItems: ProductCardData[];
  initialPage: number;
  totalPages: number;
  baseParams: Record<string, string>;
  className?: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPage);
  const [pages, setPages] = useState(totalPages);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Filters/search changing server-side means a fresh initial page — reset local state to match.
  useEffect(() => {
    setItems(initialItems);
    setPage(initialPage);
    setPages(totalPages);
  }, [initialItems, initialPage, totalPages]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(baseParams);
      params.set("page", String(page + 1));
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems((prev) => [...prev, ...json.data.items]);
        setPage(json.data.page);
        setPages(json.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, baseParams]);

  const hasMore = page < pages;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) loadMore();
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <div>
      <div className={cn("grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:px-0 xl:grid-cols-4", className)}>
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      <div ref={sentinelRef} className="mt-6 flex items-center justify-center px-4 sm:px-0">
        {loading && (
          <span className="flex items-center gap-2 text-sm text-ink-400">
            <Loader2 size={16} className="animate-spin" /> Loading more toys...
          </span>
        )}
      </div>
    </div>
  );
}
