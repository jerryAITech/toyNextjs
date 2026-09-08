"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, CalendarDays, ShoppingBag, Star as StarIcon, UserX2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StarRating } from "@/components/ui/StarRating";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { useToast } from "@/context/ToastContext";
import { formatINR } from "@/lib/utils/pricing";

type UserDetail = {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

type OrderRow = {
  _id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: unknown[];
};

type ReviewRow = {
  _id: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
  createdAt: string;
  productId: { _id: string; name: string; slug: string } | null;
};

const REVIEW_STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  HIDDEN: "neutral",
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    const res = await fetch(`/api/admin/users/${id}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      setNotFound(true);
      setUser(null);
      setLoading(false);
      return;
    }
    setUser(json.data?.user ?? null);
    setOrders(json.data?.orders ?? []);
    setReviews(json.data?.reviews ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleStatus() {
    if (!user) return;
    const next = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setUpdating(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const json = await res.json();
    setUpdating(false);
    if (json.success) {
      showToast(`User ${next === "ACTIVE" ? "activated" : "deactivated"}`, "success");
      load();
    } else {
      showToast(json.message || "Failed to update status", "error");
    }
  }

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-4 h-6 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div>
        <Link href="/admin/users" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700">
          <ArrowLeft size={15} /> Back to Users
        </Link>
        <EmptyState icon={UserX2} title="User not found" description="This user may have been removed." />
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/users" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700">
        <ArrowLeft size={15} /> Back to Users
      </Link>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold text-ink-900">{user.name}</h1>
            <Badge tone={user.status === "ACTIVE" ? "success" : "neutral"}>{user.status}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-500">
            <span className="flex items-center gap-1.5">
              <Mail size={14} /> {user.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={14} /> {user.mobile || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
        <button
          onClick={toggleStatus}
          disabled={updating}
          className={
            user.status === "ACTIVE"
              ? "rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              : "rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
          }
        >
          {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
        </button>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-ink-900">
          <ShoppingBag size={17} /> Recent Orders
        </h2>
        {orders.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No orders yet" description="This user hasn't placed any orders." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Order #</TH>
                <TH>Date</TH>
                <TH>Items</TH>
                <TH>Total</TH>
                <TH>Status</TH>
                <TH>Payment</TH>
              </TR>
            </THead>
            <TBody>
              {orders.map((o) => (
                <TR key={o._id}>
                  <TD>
                    <Link href={`/admin/orders/${o._id}`} className="font-medium text-primary-600 hover:text-primary-700">
                      {o.orderNumber}
                    </Link>
                  </TD>
                  <TD>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</TD>
                  <TD>{Array.isArray(o.items) ? o.items.length : "—"}</TD>
                  <TD>{formatINR(o.total)}</TD>
                  <TD>
                    <OrderStatusBadge status={o.orderStatus} />
                  </TD>
                  <TD>{o.paymentMethod}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-ink-900">
          <StarIcon size={17} /> Reviews
        </h2>
        {reviews.length === 0 ? (
          <EmptyState icon={StarIcon} title="No reviews yet" description="This user hasn't written any reviews." />
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r._id} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StarRating rating={r.rating} size={14} />
                    <Badge tone={REVIEW_STATUS_TONE[r.status] || "neutral"}>{r.status}</Badge>
                  </div>
                  <span className="text-xs text-ink-400">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {r.productId && (
                  <Link href={`/product/${r.productId.slug}`} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                    {r.productId.name}
                  </Link>
                )}
                <p className="mt-1 line-clamp-2 text-sm text-ink-600">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
