"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { useToast } from "@/context/ToastContext";
import { formatINR } from "@/lib/utils/pricing";
import { ORDER_STATUSES } from "@/lib/constants/orderStatus";

type OrderItem = { productId: string; productName: string; slug: string; sku: string; image: string; quantity: number; price: number; mrp: number; finalPrice: number };
type AdminOrderDetail = {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  addressSnapshot: { fullName: string; mobile: string; house: string; street: string; area?: string; city: string; state: string; pincode: string; landmark?: string };
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  couponDiscount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  timeline: { status: string; at: string; note?: string }[];
  createdAt: string;
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [customer, setCustomer] = useState<{ name: string; email: string; mobile?: string } | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const { showToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/orders/${params.id}`);
    const json = await res.json();
    if (!json.success) {
      setNotFoundState(true);
      return;
    }
    setOrder(json.data.order);
    setCustomer(json.data.customer);
    setSelectedStatus(json.data.order.orderStatus);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusUpdate() {
    if (!order || selectedStatus === order.orderStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast("Order status updated", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update status", "error");
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason || "Cancelled by admin" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast("Order cancelled", "success");
      setCancelOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not cancel order", "error");
    } finally {
      setUpdating(false);
    }
  }

  if (notFoundState) return <p className="text-sm text-ink-500">Order not found.</p>;
  if (!order) return <Skeleton className="h-96 w-full" />;

  const canCancel = !["DELIVERED", "CANCELLED", "PAYMENT_FAILED"].includes(order.orderStatus);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Order #{order.orderNumber}</h1>
          <p className="text-xs text-ink-400">
            Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
        <Select label="Update Status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-56">
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </Select>
        <Button size="sm" onClick={handleStatusUpdate} loading={updating} disabled={selectedStatus === order.orderStatus}>
          Update Status
        </Button>
        {canCancel && (
          <Button size="sm" variant="danger" onClick={() => setCancelOpen(true)}>
            Cancel Order
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
          <h2 className="mb-3 text-sm font-semibold text-ink-800">Order Tracking</h2>
          <OrderTimeline currentStatus={order.orderStatus} />
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
            <h2 className="mb-2 text-sm font-semibold text-ink-800">Customer</h2>
            <p className="text-sm text-ink-600">{customer?.name}</p>
            <p className="text-sm text-ink-500">{customer?.email}</p>
            {customer?.mobile && <p className="text-sm text-ink-500">{customer.mobile}</p>}
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
            <h2 className="mb-2 text-sm font-semibold text-ink-800">Shipping Address</h2>
            <p className="text-sm text-ink-600">{order.addressSnapshot.fullName}</p>
            <p className="text-sm text-ink-500">
              {order.addressSnapshot.house}, {order.addressSnapshot.street}
              {order.addressSnapshot.area ? `, ${order.addressSnapshot.area}` : ""}, {order.addressSnapshot.city}, {order.addressSnapshot.state} -{" "}
              {order.addressSnapshot.pincode}
            </p>
            <p className="text-sm text-ink-500">Mobile: {order.addressSnapshot.mobile}</p>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
            <h2 className="mb-2 text-sm font-semibold text-ink-800">Payment</h2>
            <p className="text-sm text-ink-600">Method: {order.paymentMethod}</p>
            <p className="text-sm text-ink-600">Status: {order.paymentStatus}</p>
            {order.razorpayOrderId && <p className="text-xs text-ink-400">Razorpay Order: {order.razorpayOrderId}</p>}
            {order.razorpayPaymentId && <p className="text-xs text-ink-400">Payment ID: {order.razorpayPaymentId}</p>}
          </section>
        </div>
      </div>

      <section className="mt-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold text-ink-800">Items</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-ink-50 pb-3 last:border-0 last:pb-0">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                {item.image && <Image src={item.image} alt={item.productName} fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${item.slug}`} className="truncate text-sm font-medium text-ink-800 hover:text-primary-600">
                  {item.productName}
                </Link>
                <p className="text-xs text-ink-400">SKU: {item.sku} · Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-ink-800">{formatINR(item.finalPrice)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-dashed border-ink-200 pt-4 text-sm text-ink-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span>Product Discount</span>
              <span>− {formatINR(order.discount)}</span>
            </div>
          )}
          {order.couponDiscount > 0 && (
            <div className="flex justify-between">
              <span>Coupon ({order.couponCode})</span>
              <span>− {formatINR(order.couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{order.shipping === 0 ? "FREE" : formatINR(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-ink-900">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
      </section>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this order?">
        <p className="mb-3 text-sm text-ink-500">Stock will be restored automatically. This action cannot be undone.</p>
        <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation" />
        <div className="mt-3 flex gap-2">
          <Button variant="danger" loading={updating} onClick={handleCancel}>
            Confirm Cancellation
          </Button>
          <Button variant="ghost" onClick={() => setCancelOpen(false)}>
            Back
          </Button>
        </div>
      </Modal>
    </div>
  );
}
