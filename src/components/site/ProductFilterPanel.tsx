"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AGE_GROUP_LABELS } from "@/lib/utils/ageGroups";

export type FilterOption = { label: string; value: string };

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
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");

  // Skip the auto-apply effect on mount — state is already in sync with the URL then.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string) => (value ? params.set(key, value) : params.delete(key));

    setOrDelete("ageGroup", ageGroup);
    setOrDelete("brand", brand);
    setOrDelete("minPrice", minPrice);
    setOrDelete("maxPrice", maxPrice);
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
    // Debounce so rapid changes (typing a price, ticking several categories) collapse into one navigation.
    const timeout = setTimeout(() => {
      router.push(qs ? `${targetPath}?${qs}` : targetPath);
    }, 400);

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
    setMinPrice("");
    setMaxPrice("");
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
        <label className="mb-1.5 block text-sm font-medium text-ink-700">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <span className="text-ink-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </div>

      <Select label="Minimum Rating" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
        <option value="">Any Rating</option>
        {[4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>
            {r}★ & above
          </option>
        ))}
      </Select>

      <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
        <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="size-4 rounded accent-primary-500" />
        In Stock Only
      </label>

      <div className="mt-2 flex gap-2">
        <Button variant="ghost" fullWidth onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
