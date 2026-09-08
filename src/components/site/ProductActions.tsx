"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils/cn";

export function ProductActions({ productId, stock }: { productId: string; stock: number }) {
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const router = useRouter();
  const wishlisted = isWishlisted(productId);
  const outOfStock = stock <= 0;

  async function handleAddToCart() {
    setBusy(true);
    await addItem(productId, quantity);
    setBusy(false);
  }

  async function handleBuyNow() {
    setBusy(true);
    const success = await addItem(productId, quantity);
    setBusy(false);
    if (success) router.push("/checkout");
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-ink-600">Quantity</span>
          <QuantityStepper value={quantity} onChange={setQuantity} max={stock} disabled={outOfStock} />
          {!outOfStock && stock < 10 && <span className="text-xs font-medium text-accent-600">Only {stock} left</span>}
        </div>
        <div className="hidden gap-3 sm:flex">
          <Button variant="outline" size="lg" className="flex-1" disabled={outOfStock || busy} loading={busy} onClick={handleAddToCart}>
            Add to Cart
          </Button>
          <Button variant="accent" size="lg" className="flex-1" disabled={outOfStock || busy} onClick={handleBuyNow}>
            Buy Now
          </Button>
          <button
            onClick={() => toggle(productId)}
            aria-label="Toggle wishlist"
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-500 hover:text-berry-500"
          >
            <Heart size={20} className={cn(wishlisted && "fill-berry-500 text-berry-500")} />
          </button>
        </div>
      </div>

      {/* Mobile sticky bar — sits above the fixed bottom nav (h-14 + its safe-area inset) so the two don't overlap */}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-2 border-t border-ink-100 bg-white p-3 sm:hidden">
        <button onClick={() => toggle(productId)} aria-label="Toggle wishlist" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-500">
          <Heart size={19} className={cn(wishlisted && "fill-berry-500 text-berry-500")} />
        </button>
        <Button variant="outline" size="md" className="flex-1" disabled={outOfStock || busy} onClick={handleAddToCart}>
          Add to Cart
        </Button>
        <Button variant="accent" size="md" className="flex-1" disabled={outOfStock || busy} onClick={handleBuyNow}>
          Buy Now
        </Button>
      </div>
    </>
  );
}
