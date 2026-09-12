"use client";

import { createContext, useContext, useState } from "react";

type AdminSidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
};

const AdminSidebarContext = createContext<AdminSidebarContextValue | null>(null);

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AdminSidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed((v) => !v) }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const ctx = useContext(AdminSidebarContext);
  if (!ctx) throw new Error("useAdminSidebar must be used within AdminSidebarProvider");
  return ctx;
}
