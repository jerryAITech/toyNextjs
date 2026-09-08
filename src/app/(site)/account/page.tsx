"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, MapPin, Lock, LogOut, ChevronRight, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";

const LINKS = [
  { href: "/account/profile", label: "Personal Information", icon: User },
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/wishlist", label: "My Wishlist", icon: Heart },
  { href: "/account/address", label: "My Addresses", icon: MapPin },
  { href: "/account/change-password", label: "Change Password", icon: Lock },
];

export default function AccountPage() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-4 rounded-2xl bg-primary-50 p-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary-500 font-display text-xl font-bold text-white">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-display text-lg font-bold text-ink-900">{user?.name}</p>
          <p className="text-sm text-ink-500">{user?.email}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center gap-3 border-b border-ink-50 px-4 py-3.5 last:border-0 hover:bg-ink-50">
            <link.icon size={18} className="text-primary-500" />
            <span className="flex-1 text-sm font-medium text-ink-700">{link.label}</span>
            <ChevronRight size={16} className="text-ink-300" />
          </Link>
        ))}
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-red-50">
          <LogOut size={18} className="text-danger" />
          <span className="flex-1 text-sm font-medium text-danger">Logout</span>
        </button>
      </div>
    </div>
  );
}
