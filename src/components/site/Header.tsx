"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, User, Menu, LogOut, Package, MapPin, ChevronDown, Video, Gamepad2 } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { Logo } from "./Logo";
import { AnnouncementBar } from "./AnnouncementBar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Drawer } from "@/components/ui/Drawer";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { AGE_GROUP_LABELS, AGE_GROUP_EMOJI } from "@/lib/utils/ageGroups";

export type NavCategory = { name: string; slug: string };

export function Header({ categories, freeShippingThreshold }: { categories: NavCategory[]; freeShippingThreshold: number }) {
  const { user, setUser } = useAuth();
  const { cart } = useCart();
  const { productIds } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [ageMenuOpen, setAgeMenuOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const prevCountRef = useRef<number | null>(null);
  const ageMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ageMenuRef.current && !ageMenuRef.current.contains(e.target as Node)) setAgeMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setAccountOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/95 backdrop-blur">
      <AnnouncementBar freeShippingThreshold={freeShippingThreshold} />

      {/* Desktop */}
      <div className="hidden items-center gap-6 px-4 py-3 md:flex xl:mx-auto xl:max-w-[1600px]">
        <Logo size={32} wordmarkClassName="text-2xl text-primary-600" />

        <div className="max-w-md flex-1">
          <SearchBar categories={categories} />
        </div>

        <nav className="flex shrink-0 items-center gap-5 text-sm font-medium text-ink-600">
          <button onClick={() => setMenuOpen(true)} className="hover:text-primary-600">
            Categories
          </button>

          <div ref={ageMenuRef} className="relative">
            <button onClick={() => setAgeMenuOpen((v) => !v)} className="flex items-center gap-1 hover:text-primary-600">
              Shop by Age <ChevronDown size={14} className={cn("transition-transform", ageMenuOpen && "rotate-180")} />
            </button>
            {ageMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-ink-100 bg-white p-2 shadow-lifted">
                {Object.entries(AGE_GROUP_LABELS).map(([key, label]) => (
                  <Link
                    key={key}
                    href={`/products?ageGroup=${key}`}
                    onClick={() => setAgeMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-primary-50 hover:text-primary-600"
                  >
                    <span>{AGE_GROUP_EMOJI[key]}</span> {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/products?trending=1" className="hover:text-primary-600">
            Trending
          </Link>
          <Link href="/explore" className="flex items-center gap-1 hover:text-primary-600">
            Explore
            <Video size={14} className="text-accent-500" aria-hidden="true" />
          </Link>
          <Link href="/games" className="flex items-center gap-1 hover:text-primary-600">
            Games
            <Gamepad2 size={14} className="text-primary-500" aria-hidden="true" />
          </Link>
          <Link href="/products?sort=discount" className="hover:text-primary-600">
            Deals
          </Link>
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

          {user ? (
            <div className="relative">
              <button onClick={() => setAccountOpen((v) => !v)} className="flex items-center gap-1.5 text-ink-600 hover:text-primary-600">
                <User size={22} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-ink-100 bg-white p-2 shadow-lifted">
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
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-full border-2 border-primary-500 px-4 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50">
                Log In
              </Link>
              <Link href="/signup" className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => setMenuOpen(true)} className="text-ink-600" aria-label="Open categories menu">
            <Menu size={22} />
          </button>
          <Logo size={26} wordmarkClassName="text-xl text-primary-600" />

          <div className="ml-auto flex items-center gap-4">
            <Link href={user ? "/account" : "/login"} className="text-ink-600" aria-label="Account">
              <User size={22} />
            </Link>
            <Link href="/wishlist" className="relative text-ink-600" aria-label="Wishlist">
              <Heart size={22} />
              {productIds.size > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                  {productIds.size}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative text-ink-600" aria-label="Cart">
              <ShoppingCart size={22} className={cn(cartBump && "animate-heart-pop")} />
              {(cart?.itemCount ?? 0) > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  {cart?.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
        <div className="px-4 pb-3">
          <SearchBar categories={categories} inputId="site-search-input" />
        </div>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Shop by Category" side="left">
        <div className="flex flex-col gap-1">
          <Link href="/products" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50">
            All Products
          </Link>
          <Link href="/games" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-accent-600 hover:bg-accent-50">
            <Gamepad2 size={16} /> Arcade Games 🎮
          </Link>
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
