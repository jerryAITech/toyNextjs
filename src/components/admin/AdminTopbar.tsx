"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { AdminSidebarContent } from "./AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { useAdminSidebar } from "@/context/AdminSidebarContext";

export function AdminTopbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, setUser } = useAuth();
  const { collapsed, toggle } = useAdminSidebar();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/admin/login");
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-100 bg-white px-4 py-3 lg:px-6">
      <button onClick={() => setDrawerOpen(true)} className="text-ink-600 lg:hidden" aria-label="Open menu">
        <Menu size={22} />
      </button>

      <button
        onClick={toggle}
        className="hidden text-ink-600 hover:text-ink-900 lg:block"
        aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
      >
        {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
      </button>

      <span className="font-display text-base font-bold text-ink-900 lg:hidden">ToyStore Admin</span>

      <div className="ml-auto flex items-center gap-4">
        <span className="hidden text-sm text-ink-500 sm:inline">Hi, {user?.name}</span>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-danger">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} side="left">
        <div className="-m-4">
          <AdminSidebarContent onNavigate={() => setDrawerOpen(false)} />
        </div>
      </Drawer>
    </header>
  );
}
