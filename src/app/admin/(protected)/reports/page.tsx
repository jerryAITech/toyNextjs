"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, CreditCard, Wallet } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils/pricing";
import { FileBarChart } from "lucide-react";
import { InlineLoader } from "@/components/ui/InlineLoader";

type PaymentReportRow = { method: "RAZORPAY" | "COD"; status: "PENDING" | "PAID" | "FAILED" | "REFUNDED"; amount: number };

const REPORT_TYPES = [
  { value: "sales", label: "Sales" },
  { value: "orders", label: "Orders" },
  { value: "products", label: "Products" },
  { value: "categories", label: "Categories" },
  { value: "users", label: "Users" },
  { value: "payments", label: "Payments" },
];

const RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "month", label: "This Month" },
];

const CURRENCY_KEYS = new Set(["total", "revenue", "subtotal", "amount", "totalSpent", "discount", "shipping"]);

function humanizeKey(key: string) {
  const spaced = key.replace(/([A-Z])/g, " $1");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export default function AdminReportsPage() {
  const [type, setType] = useState("sales");
  const [range, setRange] = useState("30d");
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);

  useEffect(() => {
    setRows(null);
    fetch(`/api/admin/reports?type=${type}&range=${range}`)
      .then((r) => r.json())
      .then((json) => setRows(json.data?.rows ?? []));
  }, [type, range]);

  const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];
  const csvUrl = `/api/admin/reports?type=${type}&range=${range}&format=csv`;

  const paymentSummary = useMemo(() => {
    if (type !== "payments" || !rows) return null;
    const paymentRows = rows as unknown as PaymentReportRow[];
    const sum = (pred: (r: PaymentReportRow) => boolean) => paymentRows.filter(pred).reduce((s, r) => s + r.amount, 0);

    return (["RAZORPAY", "COD"] as const).map((method) => ({
      method,
      label: method === "RAZORPAY" ? "Razorpay" : "Cash on Delivery",
      count: paymentRows.filter((r) => r.method === method).length,
      collected: sum((r) => r.method === method && r.status === "PAID"),
      pending: sum((r) => r.method === method && r.status === "PENDING"),
      refunded: sum((r) => r.method === method && r.status === "REFUNDED"),
    }));
  }, [type, rows]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink-900">Reports</h1>
        <a
          href={csvUrl}
          download
          className="flex items-center gap-1.5 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50"
        >
          <Download size={15} /> Download CSV
        </a>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={REPORT_TYPES} active={type} onChange={setType} />
        <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-48">
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>

      {paymentSummary && rows && rows.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {paymentSummary.map((m) => (
            <div key={m.method} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-ink-800">
                  {m.method === "RAZORPAY" ? <CreditCard size={16} className="text-primary-500" /> : <Wallet size={16} className="text-sun-500" />}
                  {m.label}
                </span>
                <span className="text-xs text-ink-400">{m.count} payments in this period</span>
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
                  <p className="font-display text-sm font-bold text-ink-500">{formatINR(m.refunded)}</p>
                  <p className="text-ink-400">Refunded</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!rows ? (
        <InlineLoader />
      ) : rows.length === 0 ? (
        <EmptyState icon={FileBarChart} title="No data for this period" description="Try a different date range." />
      ) : (
        <Table>
          <THead>
            <TR>
              {columns.map((c) => (
                <TH key={c}>{humanizeKey(c)}</TH>
              ))}
            </TR>
          </THead>
          <TBody>
            {rows.map((row, i) => (
              <TR key={i}>
                {columns.map((c) => (
                  <TD key={c}>{CURRENCY_KEYS.has(c) && typeof row[c] === "number" ? formatINR(row[c] as number) : String(row[c] ?? "—")}</TD>
                ))}
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
