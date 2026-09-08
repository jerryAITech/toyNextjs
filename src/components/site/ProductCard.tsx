"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/pricing";
import { Badge } from "@/components/ui/Badge";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

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
};

export function ProductCard({ product, className }: { product: ProductCardData; className?: string }) {
  const { cart, addItem, updateItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const wishlisted = isWishlisted(product._id);
  const cartItem = cart?.items.find((i) => i.productId === product._id);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card",
        className
      )}
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square w-full overflow-hidden bg-ink-50">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-300">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {discount > 0 && (
          <Badge tone="accent" className="absolute left-2 top-2">
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
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-ink-500 shadow-soft backdrop-blur hover:text-berry-500"
        >
          <Heart size={16} className={cn(wishlisted && "fill-berry-500 text-berry-500 animate-heart-pop")} />
        </button>

        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Badge tone="neutral">Out of Stock</Badge>
          </div>
        )}
      </Link>

      <div className="relative flex flex-1 flex-col gap-1 overflow-hidden p-3">
        <svg
          className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 text-primary-50"
          viewBox="0 0 200 200"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M44.9,-58.3C57.7,-49.4,67,-34.9,71.3,-19C75.6,-3.1,74.9,14.2,67.8,28.6C60.7,43,47.2,54.5,32.1,62C17,69.5,0.3,73,-16.4,71.3C-33.1,69.6,-49.8,62.7,-60.6,50.1C-71.4,37.5,-76.3,19.2,-76.1,1.2C-75.9,-16.9,-70.6,-33.8,-59.9,-43.4C-49.2,-53,-33.1,-55.3,-18.6,-62.5C-4.1,-69.7,8.8,-81.8,21.9,-79.9C35,-78,44.9,-67.2,44.9,-58.3Z" />
        </svg>

        <span className="relative z-10 h-3.5 text-[11px] font-medium uppercase tracking-wide text-ink-400">{product.brand || " "}</span>
        <Link href={`/product/${product.slug}`} className="relative z-10 line-clamp-2 h-10 text-sm font-semibold text-ink-800 hover:text-primary-600">
          {product.name}
        </Link>

        <div className="relative z-10 mt-1 flex items-baseline gap-1.5">
          <span className="font-display text-base font-bold text-ink-900">{formatINR(product.price)}</span>
          {product.mrp > product.price && <span className="text-xs text-ink-400 line-through">{formatINR(product.mrp)}</span>}
        </div>

        {cartItem && cartItem.quantity > 0 ? (
          <QuantityStepper
            value={cartItem.quantity}
            min={0}
            max={product.stock}
            onChange={(next) => updateItem(product._id, next)}
            className="mt-2 w-full"
          />
        ) : (
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => addItem(product._id, 1)}
            className="mt-2 flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary-50 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart size={15} />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
