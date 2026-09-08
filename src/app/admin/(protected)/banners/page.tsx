"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminPaginationFooter } from "@/components/admin/AdminPaginationFooter";
import { usePagination } from "@/lib/hooks/usePagination";
import { useToast } from "@/context/ToastContext";
import { InlineLoader } from "@/components/ui/InlineLoader";

type BannerRow = {
  _id: string;
  title?: string;
  subtitle?: string;
  desktopImage: string;
  priority: number;
  status: "ACTIVE" | "INACTIVE";
  startDate?: string | null;
  endDate?: string | null;
  categoryId?: { name: string } | null;
};

export default function AdminBannersPage() {
  const [type, setType] = useState<"HOME" | "CATEGORY">("HOME");
  const [banners, setBanners] = useState<BannerRow[] | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setBanners(null);
    const res = await fetch(`/api/admin/banners?type=${type}`);
    const json = await res.json();
    setBanners(json.data?.banners ?? []);
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  const { page, setPage, totalPages, paged } = usePagination(banners ?? [], 9);

  useEffect(() => {
    setPage(1);
  }, [type, setPage]);

  async function toggleStatus(id: string, current: string) {
    const res = await fetch(`/api/admin/banners/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: current === "ACTIVE" ? "INACTIVE" : "ACTIVE" }),
    });
    const json = await res.json();
    if (json.success) load();
    else showToast(json.message, "error");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      showToast("Banner deleted", "success");
      load();
    } else {
      showToast(json.message, "error");
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink-900">Banner Management</h1>
        <Link
          href={`/admin/banners/create?type=${type}`}
          className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
        >
          <Plus size={16} /> Add Banner
        </Link>
      </div>

      <Tabs
        className="mb-5"
        tabs={[
          { value: "HOME", label: "Homepage Banners" },
          { value: "CATEGORY", label: "Category Banners" },
        ]}
        active={type}
        onChange={(v) => setType(v as "HOME" | "CATEGORY")}
      />

      {!banners ? (
        <InlineLoader />
      ) : banners.length === 0 ? (
        <EmptyState
          icon={ImageOff}
          title={type === "HOME" ? "No homepage banners yet" : "No category banners yet"}
          description="Add a banner to promote products and offers."
          actionLabel="Add Banner"
          actionHref={`/admin/banners/create?type=${type}`}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paged.map((b) => (
            <div key={b._id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
              <div className="relative aspect-[3/1] bg-ink-50">
                {b.desktopImage && <Image src={b.desktopImage} alt={b.title || "Banner"} fill sizes="400px" className="object-cover" />}
              </div>
              <div className="p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-semibold text-ink-800">{b.title || "Untitled Banner"}</p>
                  <button onClick={() => toggleStatus(b._id, b.status)}>
                    <Badge tone={b.status === "ACTIVE" ? "success" : "neutral"}>{b.status}</Badge>
                  </button>
                </div>
                {b.subtitle && <p className="mb-2 text-xs text-ink-500">{b.subtitle}</p>}
                {type === "CATEGORY" && b.categoryId && <p className="mb-2 text-xs text-primary-600">Category: {b.categoryId.name}</p>}
                <p className="mb-3 text-xs text-ink-400">
                  Priority: {b.priority} · {b.startDate || b.endDate ? "Scheduled" : "Always active"}
                </p>
                <div className="flex gap-3">
                  <Link href={`/admin/banners/${b._id}`} className="flex items-center gap-1 text-xs font-semibold text-primary-600">
                    <Pencil size={13} /> Edit
                  </Link>
                  <button onClick={() => handleDelete(b._id)} className="flex items-center gap-1 text-xs font-semibold text-danger">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminPaginationFooter page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
