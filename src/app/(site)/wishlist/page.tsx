"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const [fetched, setFetched] = useState<ProductCardData[] | null>(null);
  const { productIds } = useWishlist();

  async function load() {
    const res = await fetch("/api/wishlist");
    const json = await res.json();
    setFetched(json.data?.products ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  // Re-filter the fetched list against the live wishlist context on every render, so tapping the
  // heart on a card here (which updates that shared context optimistically) removes the card
  // immediately instead of waiting for a refetch.
  const products = fetched?.filter((p) => productIds.has(p._id)) ?? null;

  if (products === null) {
    return (
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <EmptyState icon={Heart} title="Save your favorite toys here" description="Tap the heart icon on any toy to add it to your wishlist." actionLabel="Browse Toys" actionHref="/products" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 font-display text-xl font-bold text-ink-900 sm:text-2xl">My Wishlist ({products.length})</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
