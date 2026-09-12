import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminSidebarProvider } from "@/context/AdminSidebarContext";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSidebarProvider>
      <div className="flex h-screen overflow-hidden bg-ink-50">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
