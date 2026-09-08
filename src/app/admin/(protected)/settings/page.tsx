"use client";

import { useEffect, useState } from "react";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import { ORDER_STATUSES } from "@/lib/constants/orderStatus";

type SettingsValues = {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  codEnabled: boolean;
  codMaxOrderAmount: number;
  razorpayEnabled: boolean;
  shippingFee: number;
  freeShippingThreshold: number;
  cancellationWindowStatus: string;
  lowStockThreshold: number;
};

export default function AdminSettingsPage() {
  const [values, setValues] = useState<SettingsValues | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => setValues(json.data));
  }, []);

  function set<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast("Settings saved", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!values) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-bold text-ink-900">Settings</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 pb-10">
        <FormSection title="Store Information">
          <div className="space-y-4">
            <Input label="Store Name" value={values.storeName} onChange={(e) => set("storeName", e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Contact Email" type="email" value={values.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
              <Input label="Contact Phone" value={values.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
            </div>
            <Textarea label="Address" rows={2} value={values.address} onChange={(e) => set("address", e.target.value)} />
            <Input label="Currency" value={values.currency} onChange={(e) => set("currency", e.target.value)} />
          </div>
        </FormSection>

        <FormSection title="Payments & Shipping">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
                <input type="checkbox" checked={values.codEnabled} onChange={(e) => set("codEnabled", e.target.checked)} className="size-4 rounded accent-primary-500" />
                Cash on Delivery Enabled
              </label>
              <Input label="COD Max Order Amount (₹)" type="number" value={values.codMaxOrderAmount} onChange={(e) => set("codMaxOrderAmount", Number(e.target.value))} />
              <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
                <input type="checkbox" checked={values.razorpayEnabled} onChange={(e) => set("razorpayEnabled", e.target.checked)} className="size-4 rounded accent-primary-500" />
                Razorpay Enabled
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Shipping Fee (₹)" type="number" value={values.shippingFee} onChange={(e) => set("shippingFee", Number(e.target.value))} />
              <Input
                label="Free Shipping Threshold (₹)"
                type="number"
                value={values.freeShippingThreshold}
                onChange={(e) => set("freeShippingThreshold", Number(e.target.value))}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Operations">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Cancellation Window Status"
              value={values.cancellationWindowStatus}
              onChange={(e) => set("cancellationWindowStatus", e.target.value)}
              hint="Orders can be cancelled by customers up to this status"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </Select>
            <Input label="Default Low Stock Threshold" type="number" value={values.lowStockThreshold} onChange={(e) => set("lowStockThreshold", Number(e.target.value))} />
          </div>
        </FormSection>

        <Button type="submit" variant="primary" size="lg" loading={saving}>
          Save Settings
        </Button>
      </form>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:p-6">
      <h2 className="mb-4 font-display text-base font-bold text-ink-900">{title}</h2>
      {children}
    </div>
  );
}
