"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPaginationFooter } from "@/components/admin/AdminPaginationFooter";
import { usePagination } from "@/lib/hooks/usePagination";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { formatINR } from "@/lib/utils/pricing";
import { ORDER_STATUSES } from "@/lib/constants/orderStatus";
import { ShoppingCart } from "lucide-react";
import { InlineLoader } from "@/components/ui/InlineLoader";

type AdminOrder = {
  _id: string;
  orderNumber: string;
  items: { productName: string }[];
  total: number;
  paymentMethod: "RAZORPAY" | "COD";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  orderStatus: string;
  createdAt: string;
  userId?: { name: string; email: string } | null;
};

const PAYMENT_STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "danger",
  REFUNDED: "neutral",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    if (paymentMethod !== "all") params.set("paymentMethod", paymentMethod);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const json = await res.json();
    setOrders(json.data?.orders ?? []);
  }, [q, status, paymentMethod]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const { page, setPage, totalPages, paged } = usePagination(orders ?? [], 10);

  useEffect(() => {
    setPage(1);
  }, [q, status, paymentMethod, setPage]);

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-bold text-ink-900">Orders</h1>

      <AdminFilterBar>
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order number..."
            className="w-full rounded-2xl border border-ink-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48 shrink-0">
          <option value="all">All Status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </Select>
        <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-40 shrink-0">
          <option value="all">All Payments</option>
          <option value="RAZORPAY">Razorpay</option>
          <option value="COD">COD</option>
        </Select>
      </AdminFilterBar>

      {!orders ? (
        <InlineLoader />
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Try adjusting your filters." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Order #</TH>
              <TH>Customer</TH>
              <TH numeric>Items</TH>
              <TH numeric>Total</TH>
              <TH>Payment</TH>
              <TH>Status</TH>
              <TH>Date</TH>
            </TR>
          </THead>
          <TBody>
            {paged.map((o) => (
              <TR key={o._id}>
                <TD>
                  <Link href={`/admin/orders/${o._id}`} className="font-semibold text-primary-600">
                    #{o.orderNumber}
                  </Link>
                </TD>
                <TD>
                  <div>
                    <p className="font-medium">{o.userId?.name || "Guest"}</p>
                    <p className="text-xs text-ink-400">{o.userId?.email}</p>
                  </div>
                </TD>
                <TD numeric>{o.items.length}</TD>
                <TD numeric className="font-semibold">
                  {formatINR(o.total)}
                </TD>
                <TD>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-ink-500">{o.paymentMethod}</span>
                    <Badge tone={PAYMENT_STATUS_TONE[o.paymentStatus] || "neutral"}>{o.paymentStatus}</Badge>
                  </div>
                </TD>
                <TD>
                  <OrderStatusBadge status={o.orderStatus} />
                </TD>
                <TD className="whitespace-nowrap text-xs text-ink-500">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
