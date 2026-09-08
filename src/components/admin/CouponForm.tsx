"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

export type CouponFormValues = {
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minimumCartValue: number;
  maximumDiscount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  perUserLimit: number;
  firstOrderOnly: boolean;
  status: "ACTIVE" | "INACTIVE";
};

export const EMPTY_COUPON: CouponFormValues = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: 0,
  minimumCartValue: 0,
  maximumDiscount: null,
  startDate: "",
  endDate: "",
  usageLimit: null,
  perUserLimit: 1,
  firstOrderOnly: false,
  status: "ACTIVE",
};

export function CouponForm({ couponId, initial }: { couponId?: string; initial?: Partial<CouponFormValues> }) {
  const [values, setValues] = useState<CouponFormValues>({ ...EMPTY_COUPON, ...initial });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  function set<K extends keyof CouponFormValues>(key: K, value: CouponFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(couponId ? `/api/admin/coupons/${couponId}` : "/api/admin/coupons", {
        method: couponId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          startDate: values.startDate || null,
          endDate: values.endDate || null,
          applicableProducts: [],
          applicableCategories: [],
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Could not save coupon");
      showToast(couponId ? "Coupon updated" : "Coupon created", "success");
      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save coupon", "error");
    } finally {
      setSaving(false);
    }
  }

  const valueLabel = values.type === "PERCENTAGE" ? "Discount %" : "Discount Amount (₹)";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">
      <FormSection title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Code"
            required
            value={values.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
          />
          <Select label="Type" value={values.type} onChange={(e) => set("type", e.target.value as "PERCENTAGE" | "FIXED")}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed</option>
          </Select>
          <Input
            label={valueLabel}
            type="number"
            required
            min={0}
            value={values.value}
            onChange={(e) => set("value", Number(e.target.value))}
          />
          <Select label="Status" value={values.status} onChange={(e) => set("status", e.target.value as "ACTIVE" | "INACTIVE")}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
        <Input className="mt-4" label="Description" value={values.description} onChange={(e) => set("description", e.target.value)} />
      </FormSection>

      <FormSection title="Rules & Limits">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Minimum Cart Value (₹)"
            type="number"
            min={0}
            value={values.minimumCartValue}
            onChange={(e) => set("minimumCartValue", Number(e.target.value))}
          />
          <Input
            label="Maximum Discount (₹)"
            type="number"
            min={0}
            hint="Only applies to percentage coupons"
            value={values.maximumDiscount ?? ""}
            onChange={(e) => set("maximumDiscount", e.target.value === "" ? null : Number(e.target.value))}
          />
          <Input
            label="Usage Limit"
            type="number"
            min={0}
            hint="Leave blank for unlimited"
            value={values.usageLimit ?? ""}
            onChange={(e) => set("usageLimit", e.target.value === "" ? null : Number(e.target.value))}
          />
          <Input
            label="Per User Limit"
            type="number"
            min={1}
            value={values.perUserLimit}
            onChange={(e) => set("perUserLimit", Number(e.target.value))}
          />
          <Input label="Start Date" type="date" value={values.startDate} onChange={(e) => set("startDate", e.target.value)} />
          <Input label="End Date" type="date" value={values.endDate} onChange={(e) => set("endDate", e.target.value)} />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            checked={values.firstOrderOnly}
            onChange={(e) => set("firstOrderOnly", e.target.checked)}
            className="size-4 rounded accent-primary-500"
          />
          First Order Only
        </label>
      </FormSection>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="lg" loading={saving}>
          {couponId ? "Save Changes" : "Create Coupon"}
        </Button>
      </div>
    </form>
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
