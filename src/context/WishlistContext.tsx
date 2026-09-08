"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

type WishlistContextValue = {
  productIds: Set<string>;
  loading: boolean;
  refresh: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setProductIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist");
      const json = await res.json();
      const products = json.data?.products ?? [];
      setProductIds(new Set(products.map((p: { _id: string }) => p._id)));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        showToast("Please log in to save items to your wishlist", "info");
        return;
      }

      const isCurrentlyWishlisted = productIds.has(productId);
      setProductIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyWishlisted) next.delete(productId);
        else next.add(productId);
        return next;
      });

      try {
        if (isCurrentlyWishlisted) {
          await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
        } else {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
          showToast("Added to wishlist", "success");
        }
      } catch {
        refresh();
      }
    },
    [productIds, user, showToast, refresh]
  );

  const isWishlisted = useCallback((productId: string) => productIds.has(productId), [productIds]);

  return (
    <WishlistContext.Provider value={{ productIds, loading, refresh, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
