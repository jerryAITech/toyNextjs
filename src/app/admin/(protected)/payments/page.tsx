"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, Wallet, IndianRupee, Clock, RotateCcw, XCircle } from "lucide-react";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/admin/StatCard";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPaginationFooter } from "@/components/admin/AdminPaginationFooter";
import { usePagination } from "@/lib/hooks/usePagination";
import { formatINR } from "@/lib/utils/pricing";
import { InlineLoader } from "@/components/ui/InlineLoader";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
type PaymentMethod = "RAZORPAY" | "COD";

type AdminPayment = {
  _id: string;
  orderId: { _id: string; orderNumber: string } | null;
  userId: { _id: string; name: string; email: string } | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
};

const STATUS_TONE: Record<PaymentStatus, "success" | "warning" | "danger" | "neutral"> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "danger",
  REFUNDED: "neutral",
};

function sumWhere(payments: AdminPayment[], predicate: (p: AdminPayment) => boolean) {
  return payments.filter(predicate).reduce((s, p) => s + p.amount, 0);
}

export default function AdminPaymentsPage() {
  const [allPayments, setAllPayments] = useState<AdminPayment[] | null>(null);
  const [payments, setPayments] = useState<AdminPayment[] | null>(null);
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");

  // Unfiltered snapshot powers the summary cards & method breakdown, independent of the table filters below.
  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((json) => setAllPayments(json.data?.payments ?? []));
  }, []);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (method !== "all") params.set("method", method);
    const res = await fetch(`/api/admin/payments?${params.toString()}`);
    const json = await res.json();
    setPayments(json.data?.payments ?? []);
  }, [status, method]);

  useEffect(() => {
    load();
  }, [load]);

  const { page, setPage, totalPages, paged } = usePagination(payments ?? [], 10);

  useEffect(() => {
    setPage(1);
  }, [status, method, setPage]);

  const summary = useMemo(() => {
    const p = allPayments ?? [];
    return {
      totalCollected: sumWhere(p, (x) => x.status === "PAID"),
      razorpayCollected: sumWhere(p, (x) => x.status === "PAID" && x.method === "RAZORPAY"),
      codCollected: sumWhere(p, (x) => x.status === "PAID" && x.method === "COD"),
      pending: sumWhere(p, (x) => x.status === "PENDING"),
      refunded: sumWhere(p, (x) => x.status === "REFUNDED"),
      failedCount: p.filter((x) => x.status === "FAILED").length,
      methods: [
        {
          method: "RAZORPAY" as const,
          label: "Razorpay",
          count: p.filter((x) => x.method === "RAZORPAY").length,
          collected: sumWhere(p, (x) => x.method === "RAZORPAY" && x.status === "PAID"),
          pending: sumWhere(p, (x) => x.method === "RAZORPAY" && x.status === "PENDING"),
          failed: sumWhere(p, (x) => x.method === "RAZORPAY" && x.status === "FAILED"),
          refunded: sumWhere(p, (x) => x.method === "RAZORPAY" && x.status === "REFUNDED"),
        },
        {
          method: "COD" as const,
          label: "Cash on Delivery",
          count: p.filter((x) => x.method === "COD").length,
          collected: sumWhere(p, (x) => x.method === "COD" && x.status === "PAID"),
          pending: sumWhere(p, (x) => x.method === "COD" && x.status === "PENDING"),
          failed: sumWhere(p, (x) => x.method === "COD" && x.status === "FAILED"),
          refunded: sumWhere(p, (x) => x.method === "COD" && x.status === "REFUNDED"),
        },
      ],
    };
  }, [allPayments]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink-900">Payments</h1>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={IndianRupee} label="Total Collected" value={formatINR(summary.totalCollected)} tone="mint" />
        <StatCard icon={CreditCard} label="Razorpay Collected" value={formatINR(summary.razorpayCollected)} tone="primary" />
        <StatCard icon={Wallet} label="COD Collected" value={formatINR(summary.codCollected)} tone="sun" />
        <StatCard icon={Clock} label="Pending" value={formatINR(summary.pending)} tone="accent" />
        <StatCard icon={RotateCcw} label="Refunded" value={formatINR(summary.refunded)} tone="berry" />
      </div>

      <div className="mb-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold text-ink-800">By Payment Method</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {summary.methods.map((m) => (
            <div key={m.method} className="rounded-xl border border-ink-100 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-ink-800">
                  {m.method === "RAZORPAY" ? <CreditCard size={16} className="text-primary-500" /> : <Wallet size={16} className="text-sun-500" />}
                  {m.label}
                </span>
                <span className="text-xs text-ink-400">{m.count} transactions</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-display text-sm font-bold text-mint-700">{formatINR(m.collected)}</p>
                  <p className="text-ink-400">Collected</p>
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-accent-600">{formatINR(m.pending)}</p>
                  <p className="text-ink-400">Pending</p>
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-danger">{formatINR(m.failed)}</p>
                  <p className="text-ink-400">Failed</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {summary.failedCount > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-danger">
            <XCircle size={13} /> {summary.failedCount} failed payment{summary.failedCount > 1 ? "s" : ""} across all methods.
          </p>
        )}
      </div>

      <AdminFilterBar>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44 shrink-0">
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </Select>
        <Select value={method} onChange={(e) => setMethod(e.target.value)} className="w-44 shrink-0">
          <option value="all">All Methods</option>
          <option value="RAZORPAY">Razorpay</option>
          <option value="COD">COD</option>
        </Select>
      </AdminFilterBar>

      {!payments ? (
        <InlineLoader />
      ) : payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments found" description="Try adjusting your filters." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Order #</TH>
              <TH>Customer</TH>
              <TH>Payment ID</TH>
              <TH>Amount</TH>
              <TH>Method</TH>
              <TH>Status</TH>
              <TH>Date</TH>
            </TR>
          </THead>
          <TBody>
            {paged.map((p) => (
              <TR key={p._id}>
                <TD>
                  {p.orderId ? (
                    <Link href={`/admin/orders/${p.orderId._id}`} className="font-medium text-primary-600 hover:text-primary-700">
                      {p.orderId.orderNumber}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD>
                  <div className="flex flex-col">
                    <span className="font-medium">{p.userId?.name || "—"}</span>
                    <span className="text-xs text-ink-400">{p.userId?.email}</span>
                  </div>
                </TD>
                <TD className="font-mono text-xs">{p.razorpayPaymentId || "—"}</TD>
                <TD>{formatINR(p.amount)}</TD>
                <TD>
                  <Badge tone={p.method === "RAZORPAY" ? "primary" : "neutral"}>{p.method === "RAZORPAY" ? "Razorpay" : "COD"}</Badge>
                </TD>
                <TD>
                  <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                </TD>
                <TD>{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <AdminPaginationFooter page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
