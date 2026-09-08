"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  ShoppingCart,
  Tag,
  Image as ImageIcon,
  Star,
  Boxes,
  CreditCard,
  BarChart3,
  Settings,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LogoMark } from "@/components/site/Logo";

const MENU = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/profile", label: "Profile", icon: UserCog },
];

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-ink-900 text-ink-300">
      <Link href="/admin/dashboard" className="flex items-center gap-2 px-5 py-5">
        <LogoMark size={24} />
        <span className="font-display text-lg font-extrabold text-white">
          Toy<span className="text-accent-400">Store</span>
        </span>
        <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Admin</span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {MENU.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary-500 text-white" : "hover:bg-ink-800 hover:text-white"
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <AdminSidebarContent />
    </aside>
  );
}
