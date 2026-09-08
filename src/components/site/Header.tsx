"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, User, Menu, Search as SearchIcon, LogOut, Package, MapPin } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Drawer } from "@/components/ui/Drawer";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export type NavCategory = { name: string; slug: string };

export function Header({ categories }: { categories: NavCategory[] }) {
  const { user, setUser } = useAuth();
  const { cart } = useCart();
  const { productIds } = useWishlist();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const prevCountRef = useRef<number | null>(null);

  useEffect(() => {
    const count = cart?.itemCount ?? 0;
    const prev = prevCountRef.current;
    prevCountRef.current = count;

    if (prev !== null && count > prev) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 350);
      return () => clearTimeout(t);
    }
  }, [cart?.itemCount]);
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setAccountOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/95 backdrop-blur">
      {/* Desktop */}
      <div className="hidden items-center gap-6 px-4 py-3 md:flex xl:mx-auto xl:max-w-[1600px]">
        <button onClick={() => setMenuOpen(true)} className="text-ink-500 hover:text-primary-600" aria-label="Open menu">
          <Menu size={20} />
        </button>

        <Logo size={32} wordmarkClassName="text-2xl text-primary-600" />

        <div className="max-w-md flex-1">
          <SearchBar />
        </div>

        <nav className="flex shrink-0 items-center gap-5 text-sm font-medium text-ink-600">
          <Link href="/products?trending=1" className="hover:text-primary-600">
            Trending
          </Link>
          <Link href="/explore" className="hover:text-primary-600">
            Explore
          </Link>
          {categories.slice(0, 2).map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="hover:text-primary-600">
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-4">
          <Link href="/wishlist" className="relative text-ink-600 hover:text-berry-500" aria-label="Wishlist">
            <Heart size={22} />
            {productIds.size > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                {productIds.size}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative text-ink-600 hover:text-primary-600" aria-label="Cart">
            <ShoppingCart size={22} className={cn(cartBump && "animate-heart-pop")} />
            {(cart?.itemCount ?? 0) > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                {cart?.itemCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button onClick={() => setAccountOpen((v) => !v)} className="flex items-center gap-1.5 text-ink-600 hover:text-primary-600">
              <User size={22} />
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-ink-100 bg-white p-2 shadow-lifted">
                {user ? (
                  <>
                    <p className="px-3 py-2 text-sm font-semibold text-ink-800">Hi, {user.name.split(" ")[0]}</p>
                    <Link href="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-ink-50">
                      <User size={15} /> My Profile
                    </Link>
                    <Link href="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-ink-50">
                      <Package size={15} /> My Orders
                    </Link>
                    <Link href="/account/address" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-ink-50">
                      <MapPin size={15} /> Addresses
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-red-50">
                      <LogOut size={15} /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 p-1">
                    <Link href="/login" onClick={() => setAccountOpen(false)} className="rounded-full bg-primary-500 py-2 text-center text-sm font-semibold text-white hover:bg-primary-600">
                      Log In
                    </Link>
                    <Link href="/signup" onClick={() => setAccountOpen(false)} className="rounded-full border border-primary-500 py-2 text-center text-sm font-semibold text-primary-600 hover:bg-primary-50">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex items-center gap-3 px-4 py-3 md:hidden">
        <Logo size={26} wordmarkClassName="text-xl text-primary-600" />
        {mobileSearchOpen ? (
          <SearchBar autoFocus className="flex-1" onNavigate={() => setMobileSearchOpen(false)} />
        ) : (
          <div className="ml-auto flex items-center gap-4">
            <button onClick={() => setMobileSearchOpen(true)} aria-label="Search" className="text-ink-600">
              <SearchIcon size={22} />
            </button>
            <Link href="/cart" className="relative text-ink-600" aria-label="Cart">
              <ShoppingCart size={22} className={cn(cartBump && "animate-heart-pop")} />
              {(cart?.itemCount ?? 0) > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  {cart?.itemCount}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Shop by Category" side="left">
        <div className="flex flex-col gap-1">
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-primary-50 hover:text-primary-600">
              {c.name}
            </Link>
          ))}
        </div>
      </Drawer>
    </header>
  );
}
