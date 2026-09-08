"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Receipt } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { formatINR } from "@/lib/utils/pricing";

type OrderSummary = {
  _id: string;
  orderNumber: string;
  items: { productName: string; image: string; quantity: number }[];
  total: number;
  paymentMethod: string;
  orderStatus: string;
  createdAt: string;
};

const TABS = [
  { value: "all", label: "All Orders" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
];

export default function OrdersPage() {
  const [status, setStatus] = useState("all");
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    setOrders(null);
    fetch(`/api/orders?status=${status}`)
      .then((r) => r.json())
      .then((json) => setOrders(json.data?.orders ?? []));
  }, [status]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 font-display text-xl font-bold text-ink-900 sm:text-2xl">My Orders</h1>
      <Tabs tabs={TABS} active={status} onChange={setStatus} className="mb-4" />

      {orders === null ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={Receipt} title="No orders yet" description="When you place an order, it will show up here." actionLabel="Start Shopping" actionHref="/products" />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o._id} href={`/orders/${o._id}`} className="block rounded-2xl border border-ink-100 bg-white p-4 shadow-soft hover:shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-800">#{o.orderNumber}</p>
                  <p className="text-xs text-ink-400">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <OrderStatusBadge status={o.orderStatus} />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex -space-x-3">
                  {o.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-ink-50">
                      {item.image && <Image src={item.image} alt={item.productName} fill sizes="48px" className="object-cover" />}
                    </div>
                  ))}
                </div>
                <div className="ml-2 flex-1">
                  <p className="text-sm text-ink-500">{o.items.length} item{o.items.length > 1 ? "s" : ""}</p>
                  <p className="text-sm font-semibold text-ink-800">{formatINR(o.total)}</p>
                </div>
                <span className="text-xs font-medium text-ink-400">{o.paymentMethod}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
