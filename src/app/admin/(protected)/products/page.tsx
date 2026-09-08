"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, TrendingUp } from "lucide-react";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD, TableActionButton, TableActionLink } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPaginationFooter } from "@/components/admin/AdminPaginationFooter";
import { usePagination } from "@/lib/hooks/usePagination";
import { useToast } from "@/context/ToastContext";
import { formatINR } from "@/lib/utils/pricing";
import { PackageSearch } from "lucide-react";
import { InlineLoader } from "@/components/ui/InlineLoader";

type AdminProduct = {
  _id: string;
  name: string;
  sku: string;
  images: string[];
  price: number;
  mrp: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE";
  isTrending: boolean;
  category?: { name: string };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const { showToast } = useToast();

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/admin/products?${params.toString()}`);
    const json = await res.json();
    setProducts(json.data?.products ?? []);
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const { page, setPage, totalPages, paged } = usePagination(products ?? [], 10);

  useEffect(() => {
    setPage(1);
  }, [q, status, setPage]);

  async function toggleStatus(id: string, current: string) {
    const next = current === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await fetch(`/api/admin/products/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const json = await res.json();
    if (json.success) load();
    else showToast(json.message, "error");
  }

  async function toggleTrending(id: string, current: boolean) {
    const res = await fetch(`/api/admin/products/${id}/flags`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag: "isTrending", value: !current }),
    });
    const json = await res.json();
    if (json.success) load();
    else showToast(json.message, "error");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product permanently?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      showToast("Product deleted", "success");
      load();
    } else {
      showToast(json.message, "error");
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink-900">Products</h1>
        <Link href="/admin/products/create" className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <AdminFilterBar>
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full rounded-2xl border border-ink-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40 shrink-0">
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </AdminFilterBar>

      {!products ? (
        <InlineLoader />
      ) : products.length === 0 ? (
        <EmptyState icon={PackageSearch} title="No products found" actionLabel="Add Product" actionHref="/admin/products/create" />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Product</TH>
              <TH>SKU</TH>
              <TH>Category</TH>
              <TH numeric>Price</TH>
              <TH numeric>Stock</TH>
              <TH>Status</TH>
              <TH>Trending</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {paged.map((p) => (
              <TR key={p._id}>
                <TD>
                  <div className="flex items-center gap-2">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                      {p.images[0] && <Image src={p.images[0]} alt={p.name} fill sizes="40px" className="object-cover" />}
                    </div>
                    <span className="line-clamp-1 font-medium">{p.name}</span>
                  </div>
                </TD>
                <TD className="text-ink-500">{p.sku}</TD>
                <TD>{p.category?.name || "—"}</TD>
                <TD numeric className="font-medium">
                  {formatINR(p.price)}
                </TD>
                <TD numeric className={p.stock === 0 ? "font-semibold text-danger" : p.stock <= 5 ? "font-semibold text-accent-600" : undefined}>
                  {p.stock}
                </TD>
                <TD>
                  <button onClick={() => toggleStatus(p._id, p.status)}>
                    <Badge tone={p.status === "ACTIVE" ? "success" : "neutral"}>{p.status}</Badge>
                  </button>
                </TD>
                <TD>
                  <button
                    onClick={() => toggleTrending(p._id, p.isTrending)}
                    aria-pressed={p.isTrending}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                      p.isTrending ? "border-accent-200 bg-accent-50 text-accent-600" : "border-ink-200 text-ink-400 hover:bg-ink-50"
                    }`}
                  >
                    <TrendingUp size={13} /> {p.isTrending ? "On" : "Off"}
                  </button>
                </TD>
                <TD>
                  <div className="flex gap-1">
                    <TableActionLink href={`/admin/products/${p._id}`} className="hover:text-primary-600" aria-label="Edit product">
                      <Pencil size={15} />
                    </TableActionLink>
                    <TableActionButton onClick={() => handleDelete(p._id)} className="hover:text-danger" aria-label="Delete product">
                      <Trash2 size={15} />
                    </TableActionButton>
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
