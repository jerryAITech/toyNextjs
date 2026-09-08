"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingCart, Volume2, VolumeX, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/pricing";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export type ExploreProduct = {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  video?: string | null;
  price: number;
  mrp: number;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  stock: number;
};

export function ExploreFeed({ products }: { products: ExploreProduct[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(index);
          }
        }
      },
      { threshold: [0.6] }
    );

    for (const el of slideRefs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [products.length]);

  if (products.length === 0) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-ink-900 px-6 text-center text-white">
        <p className="text-lg font-semibold">No toys to explore yet</p>
        <Link href="/" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink-900">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 h-dvh w-full overflow-y-scroll bg-black snap-y-mandatory no-scrollbar">
      {/* Same 40%-wide centered column (30% margin either side) as each slide below, so the top
          bar's back/mute controls line up with the video's edges instead of the full viewport's. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 mx-auto flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4 lg:w-2/5 lg:max-w-2xl">
        <Link
          href="/"
          aria-label="Close explore"
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="font-display text-base font-bold text-white">Explore</span>
        <button
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={() => setMuted((m) => !m)}
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {products.map((product, i) => (
        <ExploreSlide
          key={product._id}
          product={product}
          active={i === activeIndex}
          muted={muted}
          index={i}
          registerRef={(el) => {
            slideRefs.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}

function ExploreSlide({
  product,
  active,
  muted,
  index,
  registerRef,
}: {
  product: ExploreProduct;
  active: boolean;
  muted: boolean;
  index: number;
  registerRef: (el: HTMLDivElement | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product._id);
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);

  return (
    <div
      ref={registerRef}
      data-index={index}
      className="relative flex h-dvh w-full shrink-0 snap-start items-center justify-center bg-ink-900"
    >
      {/* Full width/height on mobile (a reels feed reads naturally edge-to-edge there); on wide
          screens the video is capped to a centered 40%-wide column — 30% of empty black letterbox
          on either side — so it doesn't stretch into an oversized, distorted rectangle. Every
          overlay (gradient, buttons, product info) lives inside this same box so it hugs the
          video's own edges instead of the full browser width. */}
      <div className="relative h-full w-full overflow-hidden lg:mx-auto lg:w-2/5 lg:max-w-2xl">
        {product.video ? (
          <video
            ref={videoRef}
            src={product.video}
            poster={product.images[0]}
            muted={muted}
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : product.images[0] ? (
          <Image src={product.images[0]} alt={product.name} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" priority={index === 0} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">No media</div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggle(product._id)}
          className="absolute right-4 bottom-40 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
        >
          <Heart size={22} className={cn(wishlisted && "fill-berry-500 text-berry-500 animate-heart-pop")} />
        </button>

        <button
          type="button"
          aria-label="Add to cart"
          disabled={product.stock <= 0}
          onClick={() => addItem(product._id, 1)}
          className="absolute right-4 bottom-24 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur disabled:opacity-40"
        >
          <ShoppingCart size={20} />
        </button>

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 pb-8 text-white">
          <span className="w-fit rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
            {product.brand || "ToyStore"}
          </span>
          <Link href={`/product/${product.slug}`} className="max-w-[85%] text-lg font-bold leading-snug">
            {product.name}
          </Link>

          {(product.rating ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-xs text-white/80">
              <Star size={13} className="fill-sun-400 text-sun-400" />
              {product.rating?.toFixed(1)} ({product.reviewCount ?? 0})
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-extrabold">{formatINR(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-sm text-white/60 line-through">{formatINR(product.mrp)}</span>
                <span className="rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-bold">{discount}% OFF</span>
              </>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="mt-2 flex h-11 w-fit items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-ink-900"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
}
