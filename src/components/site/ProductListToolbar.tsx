"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ArrowDownUp } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ProductFilterPanel, type FilterOption } from "./ProductFilterPanel";

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "discount", label: "Discount" },
];

export function ProductListToolbar({
  categories,
  brands,
  total,
  activeCategory,
}: {
  categories: FilterOption[];
  brands: string[];
  total: number;
  activeCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const currentSort = searchParams.get("sort") || "popularity";

  function setSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    setSortOpen(false);
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-3 px-4 sm:px-0">
      <p className="text-sm text-ink-500">{total} toys found</p>

      <div className="flex items-center gap-2">
        {/* Desktop sort */}
        <select
          value={currentSort}
          onChange={(e) => setSort(e.target.value)}
          className="hidden rounded-full border border-ink-200 bg-white px-3 py-2 text-sm sm:block"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>

        {/* Mobile buttons */}
        <button onClick={() => setSortOpen(true)} className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 sm:hidden">
          <ArrowDownUp size={15} /> Sort
        </button>
        <button onClick={() => setFiltersOpen(true)} className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 lg:hidden">
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <ProductFilterPanel categories={categories} brands={brands} activeCategory={activeCategory} onApplied={() => setFiltersOpen(false)} />
      </BottomSheet>

      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort By">
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setSort(o.value)}
              className={`rounded-xl px-3 py-2.5 text-left text-sm font-medium ${
                currentSort === o.value ? "bg-primary-50 text-primary-600" : "text-ink-600 hover:bg-ink-50"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
