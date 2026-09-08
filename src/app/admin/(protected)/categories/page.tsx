"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminPaginationFooter } from "@/components/admin/AdminPaginationFooter";
import { usePagination } from "@/lib/hooks/usePagination";
import { useToast } from "@/context/ToastContext";
import { InlineLoader } from "@/components/ui/InlineLoader";

type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parentCategory?: { _id: string; name: string } | string | null;
  status: "ACTIVE" | "INACTIVE";
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    const json = await res.json();
    setCategories(json.data?.categories ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { page, setPage, totalPages, paged } = usePagination(categories ?? [], 10);

  function parentName(category: AdminCategory) {
    const parent = category.parentCategory;
    if (!parent) return "—";
    if (typeof parent === "string") {
      const match = categories?.find((c) => c._id === parent);
      return match?.name || "—";
    }
    return parent.name || "—";
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category permanently?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      showToast("Category deleted", "success");
      load();
    } else {
      showToast(json.message, "error");
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink-900">Categories</h1>
        <Link href="/admin/categories/create" className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
          <Plus size={16} /> Add Category
        </Link>
      </div>

      {!categories ? (
        <InlineLoader />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories found"
          description="Create your first category to start organizing products."
          actionLabel="Add Category"
          actionHref="/admin/categories/create"
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Image</TH>
              <TH>Name</TH>
              <TH>Slug</TH>
              <TH>Parent</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {paged.map((c) => (
              <TR key={c._id}>
                <TD>
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    {c.image && <Image src={c.image} alt={c.name} fill sizes="40px" className="object-cover" />}
                  </div>
                </TD>
                <TD>
                  <span className="line-clamp-1 font-medium">{c.name}</span>
                </TD>
                <TD>{c.slug}</TD>
                <TD>{parentName(c)}</TD>
                <TD>
                  <Badge tone={c.status === "ACTIVE" ? "success" : "neutral"}>{c.status}</Badge>
                </TD>
                <TD>
                  <div className="flex gap-2">
                    <Link href={`/admin/categories/${c._id}`} className="text-primary-600">
                      <Pencil size={15} />
                    </Link>
                    <button onClick={() => handleDelete(c._id)} className="text-danger">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <AdminPaginationFooter page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
