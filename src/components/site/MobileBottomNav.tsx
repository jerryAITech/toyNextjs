"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, Receipt, User, Compass } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useWishlist } from "@/context/WishlistContext";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/products", label: "Categories", icon: LayoutGrid },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/orders", label: "Orders", icon: Receipt },
  { href: "/account", label: "Account", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { productIds } = useWishlist();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-ink-100 bg-white/95 backdrop-blur md:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
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
            {label === "Wishlist" && productIds.size > 0 && (
              <span className="absolute right-[calc(50%-16px)] top-1 flex size-4 items-center justify-center rounded-full bg-accent-500 text-[9px] font-bold text-white">
                {productIds.size}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
