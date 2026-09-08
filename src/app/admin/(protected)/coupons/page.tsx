"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminPaginationFooter } from "@/components/admin/AdminPaginationFooter";
import { usePagination } from "@/lib/hooks/usePagination";
import { useToast } from "@/context/ToastContext";
import { formatINR } from "@/lib/utils/pricing";
import { InlineLoader } from "@/components/ui/InlineLoader";

type AdminCoupon = {
  _id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minimumCartValue: number;
  usedCount: number;
  usageLimit: number | null;
  endDate: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[] | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/coupons");
    const json = await res.json();
    setCoupons(json.data?.coupons ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { page, setPage, totalPages, paged } = usePagination(coupons ?? [], 10);

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon permanently?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      showToast("Coupon deleted", "success");
      load();
    } else {
      showToast(json.message, "error");
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink-900">Coupons</h1>
        <Link href="/admin/coupons/create" className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
          <Plus size={16} /> Add Coupon
        </Link>
      </div>

      {!coupons ? (
        <InlineLoader />
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No coupons found"
          description="Create your first coupon to boost sales."
          actionLabel="Create Coupon"
          actionHref="/admin/coupons/create"
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Code</TH>
              <TH>Type / Value</TH>
              <TH>Min Cart Value</TH>
              <TH>Usage</TH>
              <TH>Valid Until</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {paged.map((c) => (
              <TR key={c._id}>
                <TD>
                  <span className="font-mono font-semibold">{c.code}</span>
                </TD>
                <TD>{c.type === "PERCENTAGE" ? `${c.value}% OFF` : `${formatINR(c.value)} OFF`}</TD>
                <TD>{formatINR(c.minimumCartValue)}</TD>
                <TD>
                  {c.usedCount} / {c.usageLimit != null ? c.usageLimit : "∞"}
                </TD>
                <TD>{c.endDate ? new Date(c.endDate).toLocaleDateString() : "No expiry"}</TD>
                <TD>
                  <Badge tone={c.status === "ACTIVE" ? "success" : "neutral"}>{c.status}</Badge>
                </TD>
                <TD>
                  <div className="flex gap-2">
                    <Link href={`/admin/coupons/${c._id}`} className="text-primary-600">
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
