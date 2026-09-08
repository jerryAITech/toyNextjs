"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

export type AddressFormValues = {
  fullName: string;
  mobile: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  type: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
};

const EMPTY: AddressFormValues = {
  fullName: "",
  mobile: "",
  house: "",
  street: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  type: "HOME",
  isDefault: false,
};

export function AddressForm({
  initial,
  addressId,
  onSaved,
  onCancel,
}: {
  initial?: Partial<AddressFormValues>;
  addressId?: string;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<AddressFormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function set<K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      const res = await fetch(addressId ? `/api/addresses/${addressId}` : "/api/addresses", {
        method: addressId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!json.success) {
        if (json.issues) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of json.issues) fieldErrors[issue.path] = issue.message;
          setErrors(fieldErrors);
        }
        throw new Error(json.message || "Could not save address");
      }
      showToast("Address saved", "success");
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save address", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Input label="Full Name" required value={values.fullName} onChange={(e) => set("fullName", e.target.value)} error={errors.fullName} />
      <Input label="Mobile Number" required value={values.mobile} onChange={(e) => set("mobile", e.target.value)} error={errors.mobile} />
      <Input label="House / Flat No." required value={values.house} onChange={(e) => set("house", e.target.value)} error={errors.house} />
      <Input label="Street" required value={values.street} onChange={(e) => set("street", e.target.value)} error={errors.street} />
      <Input label="Area / Locality" value={values.area} onChange={(e) => set("area", e.target.value)} error={errors.area} />
      <Input label="Landmark" value={values.landmark} onChange={(e) => set("landmark", e.target.value)} error={errors.landmark} />
      <Input label="City" required value={values.city} onChange={(e) => set("city", e.target.value)} error={errors.city} />
      <Input label="State" required value={values.state} onChange={(e) => set("state", e.target.value)} error={errors.state} />
      <Input label="Pincode" required value={values.pincode} onChange={(e) => set("pincode", e.target.value)} error={errors.pincode} />
      <Select label="Address Type" value={values.type} onChange={(e) => set("type", e.target.value as AddressFormValues["type"])}>
        <option value="HOME">Home</option>
        <option value="WORK">Work</option>
        <option value="OTHER">Other</option>
      </Select>

      <label className="col-span-full flex items-center gap-2 text-sm font-medium text-ink-700">
        <input type="checkbox" checked={values.isDefault} onChange={(e) => set("isDefault", e.target.checked)} className="size-4 rounded accent-primary-500" />
        Set as default address
      </label>

      <div className="col-span-full flex gap-2">
        <Button type="submit" variant="primary" loading={saving}>
          Save Address
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
