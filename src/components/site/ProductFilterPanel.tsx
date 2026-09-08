"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { StarRating } from "@/components/ui/StarRating";
import { AGE_GROUP_LABELS } from "@/lib/utils/ageGroups";
import { formatINR } from "@/lib/utils/pricing";
import { cn } from "@/lib/utils/cn";

export type FilterOption = { label: string; value: string };

const PRICE_MIN = 0;
const PRICE_MAX = 10000;
const RATING_OPTIONS = [4, 3, 2, 1];

export function ProductFilterPanel({
  categories,
  brands,
  activeCategory,
  onApplied,
}: {
  categories: FilterOption[];
  brands: string[];
  activeCategory?: string;
  onApplied?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialCategories = searchParams.get("category")?.split(",").filter(Boolean) ?? (activeCategory ? [activeCategory] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [ageGroup, setAgeGroup] = useState(searchParams.get("ageGroup") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [minPrice, setMinPrice] = useState(Number(searchParams.get("minPrice")) || PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice")) || PRICE_MAX);
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");

  // Skip the auto-apply effect on mount — state is already in sync with the URL then.
  const isFirstRender = useRef(true);

  function applyNow() {
    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string) => (value ? params.set(key, value) : params.delete(key));

    setOrDelete("ageGroup", ageGroup);
    setOrDelete("brand", brand);
    setOrDelete("minPrice", minPrice > PRICE_MIN ? String(minPrice) : "");
    setOrDelete("maxPrice", maxPrice < PRICE_MAX ? String(maxPrice) : "");
    setOrDelete("minRating", minRating);
    if (inStock) params.set("inStock", "true");
    else params.delete("inStock");
    params.delete("page");

    // /category/[slug] encodes the category in the route itself, not a query param — switching
    // categories from here needs to navigate to the new canonical /category/{slug} URL (or back
    // to the unfiltered /products listing) rather than appending ?category= to the current route.
    const onCategoryRoute = pathname.startsWith("/category/");
    let targetPath = pathname;

    if (onCategoryRoute && selectedCategories.length === 1) {
      // Exactly one category selected — stay on the canonical /category/{slug} URL.
      targetPath = `/category/${selectedCategories[0]}`;
    } else if (onCategoryRoute) {
      // Zero or multiple categories selected — that only fits the general /products listing.
      targetPath = "/products";
      setOrDelete("category", selectedCategories.join(","));
    } else {
      setOrDelete("category", selectedCategories.join(","));
    }

    const qs = params.toString();
    router.push(qs ? `${targetPath}?${qs}` : targetPath);
    onApplied?.();
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Inside the mobile bottom sheet (onApplied set), filters only take effect when the user taps
    // "Apply Filters" — auto-navigating on every tap would re-render the page behind an open sheet.
    // The desktop sidebar has no such sheet to dismiss, so it keeps the debounced auto-apply.
    if (onApplied) return;

    const timeout = setTimeout(applyNow, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, ageGroup, brand, minPrice, maxPrice, minRating, inStock]);

  function toggleCategory(value: string) {
    setSelectedCategories((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function clear() {
    setSelectedCategories([]);
    setAgeGroup("");
    setBrand("");
    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MAX);
    setMinRating("");
    setInStock(false);
    router.push(pathname);
    onApplied?.();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">
          Category{selectedCategories.length > 0 && ` (${selectedCategories.length})`}
        </label>
        <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto rounded-2xl border border-ink-200 p-1.5">
          {categories.map((c) => (
            <label key={c.value} className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-50">
              <input
                type="checkbox"
                checked={selectedCategories.includes(c.value)}
                onChange={() => toggleCategory(c.value)}
                className="size-4 shrink-0 rounded accent-primary-500"
              />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      <Select label="Age Group" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
        <option value="">All Ages</option>
        {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      {brands.length > 0 && (
        <Select label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-ink-700">Price Range</label>
          <span className="text-sm font-semibold text-ink-800">
            {formatINR(minPrice)} – {formatINR(maxPrice)}
            {maxPrice >= PRICE_MAX && "+"}
          </span>
        </div>
        <RangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          valueMin={minPrice}
          valueMax={maxPrice}
          onChange={(mn, mx) => {
            setMinPrice(mn);
            setMaxPrice(mx);
          }}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">Minimum Rating</label>
        <div className="flex flex-col gap-0.5">
          {RATING_OPTIONS.map((r) => {
            const active = minRating === String(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() => setMinRating(active ? "" : String(r))}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm transition-colors",
                  active ? "bg-primary-50 font-semibold text-primary-700" : "text-ink-600 hover:bg-ink-50"
                )}
              >
                <StarRating rating={r} size={14} />
                <span>{r}+ &amp; above</span>
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
        <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="size-4 rounded accent-primary-500" />
        In Stock Only
      </label>

      <div className="mt-2 flex gap-2">
        <Button variant="ghost" fullWidth onClick={clear}>
          Clear All
        </Button>
        {onApplied && (
          <Button variant="primary" fullWidth onClick={applyNow}>
            Apply Filters
          </Button>
        )}
      </div>
    </div>
  );
}
