"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Eye, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/pricing";
import { Badge } from "@/components/ui/Badge";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { StarRating } from "@/components/ui/StarRating";
import { Modal } from "@/components/ui/Modal";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { AGE_GROUP_LABELS } from "@/lib/utils/ageGroups";

export type ProductCardData = {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  mrp: number;
  rating?: number;
  reviewCount?: number;
  stock: number;
  brand?: string;
  ageGroup?: string;
};

export function ProductCard({ product, className }: { product: ProductCardData; className?: string }) {
  const { cart, addItem, updateItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const wishlisted = isWishlisted(product._id);
  const cartItem = cart?.items.find((i) => i.productId === product._id);
  const ageLabel = product.ageGroup ? AGE_GROUP_LABELS[product.ageGroup] : undefined;

  async function handleAdd() {
    const ok = await addItem(product._id, 1);
    if (ok) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    }
  }

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card",
        className
      )}
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square w-full overflow-hidden bg-ink-50">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 42vw, (max-width: 1024px) 25vw, 18vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-300">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {discount > 0 && (
          <Badge tone="accent" className="absolute left-1.5 top-1.5 px-2 py-0.5 text-[10px]">
            {discount}% OFF
          </Badge>
        )}

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            toggle(product._id);
          }}
          className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/90 text-ink-500 shadow-soft backdrop-blur transition-transform hover:scale-110 hover:text-berry-500"
        >
          <Heart size={14} className={cn(wishlisted && "fill-berry-500 text-berry-500 animate-heart-pop")} />
        </button>

        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Badge tone="neutral">Out of Stock</Badge>
          </div>
        )}

        <button
          type="button"
          aria-label="Quick view"
          onClick={(e) => {
            e.preventDefault();
            setQuickViewOpen(true);
          }}
          className="absolute inset-x-2 bottom-2 hidden translate-y-2 items-center justify-center gap-1.5 rounded-full bg-ink-900/85 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:flex"
        >
          <Eye size={13} /> Quick View
        </button>
      </Link>

      <div className="relative flex flex-1 flex-col gap-0.5 overflow-hidden p-2.5">
        <svg
          className="pointer-events-none absolute -right-6 -top-8 h-16 w-16 text-primary-50"
          viewBox="0 0 200 200"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M44.9,-58.3C57.7,-49.4,67,-34.9,71.3,-19C75.6,-3.1,74.9,14.2,67.8,28.6C60.7,43,47.2,54.5,32.1,62C17,69.5,0.3,73,-16.4,71.3C-33.1,69.6,-49.8,62.7,-60.6,50.1C-71.4,37.5,-76.3,19.2,-76.1,1.2C-75.9,-16.9,-70.6,-33.8,-59.9,-43.4C-49.2,-53,-33.1,-55.3,-18.6,-62.5C-4.1,-69.7,8.8,-81.8,21.9,-79.9C35,-78,44.9,-67.2,44.9,-58.3Z" />
        </svg>

        <span className="relative z-10 h-3.5 text-[10px] font-medium uppercase tracking-wide text-ink-400">{product.brand || " "}</span>
        <Link href={`/product/${product.slug}`} className="relative z-10 line-clamp-2 h-9 text-xs font-semibold text-ink-800 hover:text-primary-600 sm:text-sm">
          {product.name}
        </Link>

        {/* Fixed h-4 whether or not this product has a rating yet, so every card in a row reserves
            the same amount of space here and the CTA below lines up across the row regardless. */}
        <div className="relative z-10 flex h-4 items-center gap-1">
          {product.rating !== undefined && product.rating > 0 && (
            <>
              <StarRating rating={product.rating} size={11} />
              <span className="text-[10px] text-ink-400">({product.reviewCount ?? 0})</span>
            </>
          )}
        </div>

        <div className="relative z-10 mt-0.5 flex items-baseline gap-1.5">
          <span className="font-display text-sm font-bold text-ink-900 sm:text-base">{formatINR(product.price)}</span>
          {product.mrp > product.price && <span className="text-[11px] text-ink-400 line-through">{formatINR(product.mrp)}</span>}
        </div>

        {/* Same fixed-height reservation as the rating row above, for the same reason. */}
        <span className="relative z-10 block h-4 text-[10px] text-ink-400">{ageLabel}</span>

        {justAdded ? (
          <div className="mt-auto flex h-8 items-center justify-center gap-1.5 rounded-full bg-mint-100 text-xs font-semibold text-mint-700">
            <Check size={13} /> Added to Cart
          </div>
        ) : cartItem && cartItem.quantity > 0 ? (
          <QuantityStepper
            size="sm"
            value={cartItem.quantity}
            min={0}
            max={product.stock}
            onChange={(next) => updateItem(product._id, next)}
            className="mt-auto w-full"
          />
        ) : (
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={handleAdd}
            className="mt-auto flex h-8 items-center justify-center gap-1.5 rounded-full bg-primary-50 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart size={13} />
            Add to Cart
          </button>
        )}
      </div>

      <Modal open={quickViewOpen} onClose={() => setQuickViewOpen(false)} title={product.name}>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-ink-50 sm:w-48">
            {product.images[0] ? (
              <Image src={product.images[0]} alt={product.name} fill sizes="192px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-300">No image</div>
            )}
            {discount > 0 && (
              <Badge tone="accent" className="absolute left-2 top-2">
                {discount}% OFF
              </Badge>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {product.brand && <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{product.brand}</span>}
            <p className="text-sm font-semibold text-ink-900">{product.name}</p>

            {product.rating !== undefined && product.rating > 0 && (
              <div className="flex items-center gap-1">
                <StarRating rating={product.rating} size={13} />
                <span className="text-xs text-ink-400">({product.reviewCount ?? 0})</span>
              </div>
            )}

            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-display text-lg font-bold text-ink-900">{formatINR(product.price)}</span>
              {product.mrp > product.price && <span className="text-sm text-ink-400 line-through">{formatINR(product.mrp)}</span>}
            </div>

            {ageLabel && <span className="text-xs text-ink-400">Age: {ageLabel}</span>}

            <div className="mt-3 flex flex-col gap-2">
              {cartItem && cartItem.quantity > 0 ? (
                <QuantityStepper
                  value={cartItem.quantity}
                  min={0}
                  max={product.stock}
                  onChange={(next) => updateItem(product._id, next)}
                />
              ) : (
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={handleAdd}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary-500 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShoppingCart size={15} />
                  Add to Cart
                </button>
              )}
              <Link
                href={`/product/${product.slug}`}
                onClick={() => setQuickViewOpen(false)}
                className="text-center text-sm font-semibold text-primary-600 hover:underline"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
