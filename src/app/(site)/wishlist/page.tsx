"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils/pricing";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

type WishlistProduct = {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  mrp: number;
  stock: number;
};

export default function WishlistPage() {
  const [products, setProducts] = useState<WishlistProduct[] | null>(null);
  const { addItem } = useCart();
  const { toggle } = useWishlist();

  async function load() {
    const res = await fetch("/api/wishlist");
    const json = await res.json();
    setProducts(json.data?.products ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRemove(productId: string) {
    await toggle(productId);
    setProducts((prev) => prev?.filter((p) => p._id !== productId) ?? null);
  }

  async function handleMoveToCart(productId: string) {
    const ok = await addItem(productId, 1);
    if (ok) handleRemove(productId);
  }

  if (products === null) {
    return (
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
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
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 font-display text-xl font-bold text-ink-900 sm:text-2xl">My Wishlist ({products.length})</h1>
      <div className="space-y-3">
        {products.map((p) => (
          <div key={p._id} className="flex gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-soft">
            <Link href={`/product/${p.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ink-50">
              {p.images[0] && <Image src={p.images[0]} alt={p.name} fill sizes="80px" className="object-cover" />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <Link href={`/product/${p.slug}`} className="line-clamp-2 text-sm font-semibold text-ink-800 hover:text-primary-600">
                  {p.name}
                </Link>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-semibold text-ink-900">{formatINR(p.price)}</span>
                  {p.mrp > p.price && <span className="text-xs text-ink-400 line-through">{formatINR(p.mrp)}</span>}
                </div>
                {p.stock <= 0 && <span className="text-xs font-medium text-danger">Out of stock</span>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" disabled={p.stock <= 0} onClick={() => handleMoveToCart(p._id)}>
                  Move to Cart
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleRemove(p._id)}>
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
