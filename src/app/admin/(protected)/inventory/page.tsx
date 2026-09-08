"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Pencil, Boxes, PackageCheck, AlertTriangle, PackageX } from "lucide-react";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/admin/StatCard";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPaginationFooter } from "@/components/admin/AdminPaginationFooter";
import { usePagination } from "@/lib/hooks/usePagination";
import { InlineLoader } from "@/components/ui/InlineLoader";

type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

type InventoryRow = {
  productId: string;
  name: string;
  sku: string;
  category?: string;
  stock: number;
  reserved: number;
  sold: number;
  lowStockThreshold: number;
  status: InventoryStatus;
};

const STATUS_TONE: Record<InventoryStatus, "success" | "warning" | "danger"> = {
  IN_STOCK: "success",
  LOW_STOCK: "warning",
  OUT_OF_STOCK: "danger",
};

const STATUS_LABEL: Record<InventoryStatus, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryRow[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    fetch("/api/admin/inventory")
      .then((r) => r.json())
      .then((json) => setInventory(json.data?.inventory ?? []));
  }, []);

  const stats = useMemo(() => {
    const total = inventory?.length ?? 0;
    const low = inventory?.filter((i) => i.status === "LOW_STOCK").length ?? 0;
    const out = inventory?.filter((i) => i.status === "OUT_OF_STOCK").length ?? 0;
    return { total, low, out };
  }, [inventory]);

  const filtered = useMemo(() => {
    if (!inventory) return [];
    const query = q.trim().toLowerCase();
    return inventory.filter((i) => {
      const matchesQuery = !query || i.name.toLowerCase().includes(query) || i.sku.toLowerCase().includes(query);
      const matchesStatus = status === "all" || i.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [inventory, q, status]);

  const { page, setPage, totalPages, paged } = usePagination(filtered, 10);

  useEffect(() => {
    setPage(1);
  }, [q, status, setPage]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink-900">Inventory</h1>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={PackageCheck} label="Total Products" value={stats.total} tone="primary" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={stats.low} tone="sun" />
        <StatCard icon={PackageX} label="Out of Stock" value={stats.out} tone="berry" />
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
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44 shrink-0">
          <option value="all">All Status</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </Select>
      </AdminFilterBar>

      {!inventory ? (
        <InlineLoader />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Boxes} title="No inventory items found" description="Try adjusting your search or filters." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Product</TH>
              <TH>SKU</TH>
              <TH>Category</TH>
              <TH>Stock</TH>
              <TH>Reserved</TH>
              <TH>Sold</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {paged.map((i) => (
              <TR key={i.productId}>
                <TD className="font-medium">{i.name}</TD>
                <TD>{i.sku}</TD>
                <TD>{i.category || "—"}</TD>
                <TD>{i.stock}</TD>
                <TD>{i.reserved}</TD>
                <TD>{i.sold}</TD>
                <TD>
                  <Badge tone={STATUS_TONE[i.status]}>{STATUS_LABEL[i.status]}</Badge>
                </TD>
                <TD>
                  <Link href={`/admin/products/${i.productId}`} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700">
                    <Pencil size={15} />
                  </Link>
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
