"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gamepad2, Heart, ShoppingCart, Compass, Video } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const NAV_ITEMS = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { productIds } = useWishlist();
  const { cart } = useCart();
  const homeActive = pathname === "/";
  const gamesActive = pathname.startsWith("/games") || pathname === "/play";

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-ink-100 bg-white/95 backdrop-blur md:hidden">
      <Link
        href="/"
        className={cn(
          "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
          homeActive ? "text-primary-600" : "text-ink-400"
        )}
      >
        <Home size={20} strokeWidth={homeActive ? 2.5 : 2} />
        Home
      </Link>

      <Link
        href="/games"
        className={cn(
          "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
          gamesActive ? "text-primary-600" : "text-ink-400"
        )}
      >
        <Gamepad2 size={20} strokeWidth={gamesActive ? 2.5 : 2} />
        Games
        <span
          aria-hidden="true"
          className="absolute right-[calc(50%-15px)] top-0.5 flex size-2 rounded-full bg-sun-400"
        />
      </Link>

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
              active ? "text-primary-600" : "text-ink-400"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            {label}
            {label === "Explore" && (
              <span
                aria-hidden="true"
                className="absolute right-[calc(50%-15px)] top-0.5 flex size-3.5 items-center justify-center rounded-full bg-accent-500 text-white"
              >
                <Video size={8} strokeWidth={2.5} />
              </span>
            )}
            {label === "Wishlist" && productIds.size > 0 && (
              <span className="absolute right-[calc(50%-16px)] top-1 flex size-4 items-center justify-center rounded-full bg-accent-500 text-[9px] font-bold text-white">
                {productIds.size}
              </span>
            )}
            {label === "Cart" && (cart?.itemCount ?? 0) > 0 && (
              <span className="absolute right-[calc(50%-16px)] top-1 flex size-4 items-center justify-center rounded-full bg-primary-500 text-[9px] font-bold text-white">
                {cart?.itemCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
