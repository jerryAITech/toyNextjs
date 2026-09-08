"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { CartView } from "@/lib/services/cartService";
import { useToast } from "./ToastContext";

type CartContextValue = {
  cart: CartView | null;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<boolean>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

async function parseJson(res: Response) {
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Something went wrong.");
  return json.data as CartView;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await parseJson(res);
      setCart(data);
    } catch {
      // keep last known state on transient errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        const data = await parseJson(res);
        setCart(data);
        showToast("Added to cart", "success");
        return true;
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Could not add to cart", "error");
        return false;
      }
    },
    [showToast]
  );

  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        const data = await parseJson(res);
        setCart(data);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Could not update cart", "error");
      }
    },
    [showToast]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      try {
        const res = await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
        const data = await parseJson(res);
        setCart(data);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Could not remove item", "error");
      }
    },
    [showToast]
  );

  const applyCoupon = useCallback(
    async (code: string) => {
      try {
        const res = await fetch("/api/cart/coupon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await parseJson(res);
        setCart(data);
        showToast("Coupon applied!", "success");
        return true;
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Invalid coupon", "error");
        return false;
      }
    },
    [showToast]
  );

  const removeCoupon = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/coupon", { method: "DELETE" });
      const data = await parseJson(res);
      setCart(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not remove coupon", "error");
    }
  }, [showToast]);

  return (
    <CartContext.Provider value={{ cart, loading, refresh, addItem, updateItem, removeItem, applyCoupon, removeCoupon }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
