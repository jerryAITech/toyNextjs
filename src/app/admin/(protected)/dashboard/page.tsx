"use client";

import { useEffect, useState } from "react";
import { Users, Package, ShoppingCart, IndianRupee, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/utils/pricing";

type DashboardData = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  lowStockProducts: number;
  dailySales: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  topCategories: { name: string; revenue: number }[];
};

const RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "month", label: "This Month" },
];

export default function AdminDashboardPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    setData(null);
    fetch(`/api/admin/dashboard?range=${range}`)
      .then((r) => r.json())
      .then((json) => setData(json.data));
  }, [range]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink-900">Dashboard</h1>
        <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-48">
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>

      {!data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={IndianRupee} label="Total Revenue" value={formatINR(data.totalRevenue)} tone="mint" />
            <StatCard icon={ShoppingCart} label="Total Orders" value={data.totalOrders} tone="primary" />
            <StatCard icon={Users} label="Total Users" value={data.totalUsers} tone="accent" />
            <StatCard icon={Package} label="Total Products" value={data.totalProducts} tone="sun" />
            <StatCard icon={Clock} label="Pending Orders" value={data.pendingOrders} tone="sun" />
            <StatCard icon={CheckCircle2} label="Delivered Orders" value={data.deliveredOrders} tone="mint" />
            <StatCard icon={AlertTriangle} label="Low Stock Items" value={data.lowStockProducts} tone="berry" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
              <h2 className="mb-3 text-sm font-semibold text-ink-800">Sales Overview</h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ece9f7" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatINR(Number(v))} />
                  <Line type="monotone" dataKey="revenue" stroke="#3366ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
              <h2 className="mb-3 text-sm font-semibold text-ink-800">Orders Overview</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ece9f7" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#fa5a1f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
              <h2 className="mb-3 text-sm font-semibold text-ink-800">Top Products</h2>
              <div className="space-y-2">
                {data.topProducts.length === 0 && <p className="text-sm text-ink-400">No sales in this period.</p>}
                {data.topProducts.map((p) => (
                  <div key={p.name} className="flex justify-between text-sm">
                    <span className="text-ink-600">{p.name}</span>
                    <span className="font-semibold text-ink-800">{formatINR(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
              <h2 className="mb-3 text-sm font-semibold text-ink-800">Top Categories</h2>
              <div className="space-y-2">
                {data.topCategories.length === 0 && <p className="text-sm text-ink-400">No sales in this period.</p>}
                {data.topCategories.map((c) => (
                  <div key={c.name} className="flex justify-between text-sm">
                    <span className="text-ink-600">{c.name}</span>
                    <span className="font-semibold text-ink-800">{formatINR(c.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
