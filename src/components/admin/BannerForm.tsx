"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageListUploadField } from "@/components/admin/MediaUploadField";
import { BannerPreview } from "@/components/admin/BannerPreview";
import { useToast } from "@/context/ToastContext";

type Category = { _id: string; name: string; parentCategory: string | null };
type ProductOption = { _id: string; name: string; sku: string };

export type BannerFormValues = {
  type: "HOME" | "CATEGORY";
  categoryId: string;
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string;
  ctaText: string;
  linkType: "NONE" | "PRODUCT" | "CATEGORY" | "URL";
  productId: string;
  linkedCategoryId: string;
  customUrl: string;
  startDate: string;
  endDate: string;
  priority: number;
  status: "ACTIVE" | "INACTIVE";
};

export const EMPTY_BANNER: BannerFormValues = {
  type: "HOME",
  categoryId: "",
  title: "",
  subtitle: "",
  desktopImage: "",
  mobileImage: "",
  ctaText: "Shop Now",
  linkType: "NONE",
  productId: "",
  linkedCategoryId: "",
  customUrl: "",
  startDate: "",
  endDate: "",
  priority: 0,
  status: "ACTIVE",
};

export function BannerForm({
  bannerId,
  initial,
  defaultType,
}: {
  bannerId?: string;
  initial?: Partial<BannerFormValues>;
  defaultType?: "HOME" | "CATEGORY";
}) {
  const [values, setValues] = useState<BannerFormValues>({ ...EMPTY_BANNER, type: defaultType || "HOME", ...initial });
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((json) => setCategories((json.data?.categories ?? []).filter((c: Category) => !c.parentCategory)));
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((json) => setProducts(json.data?.products ?? []));
  }, []);

  function set<K extends keyof BannerFormValues>(key: K, value: BannerFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...values,
        categoryId: values.type === "CATEGORY" ? values.categoryId || null : null,
        productId: values.linkType === "PRODUCT" ? values.productId || null : null,
        linkedCategoryId: values.linkType === "CATEGORY" ? values.linkedCategoryId || null : null,
        customUrl: values.linkType === "URL" ? values.customUrl : "",
        startDate: values.startDate || null,
        endDate: values.endDate || null,
      };

      const res = await fetch(bannerId ? `/api/admin/banners/${bannerId}` : "/api/admin/banners", {
        method: bannerId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Could not save banner");
      showToast(bannerId ? "Banner updated" : "Banner created", "success");
      router.push("/admin/banners");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save banner", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 pb-10 lg:grid-cols-2">
      <div className="space-y-6">
        <FormSection title="Banner Type">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Type" value={values.type} onChange={(e) => set("type", e.target.value as "HOME" | "CATEGORY")}>
              <option value="HOME">Homepage</option>
              <option value="CATEGORY">Category</option>
            </Select>
            {values.type === "CATEGORY" && (
              <Select label="Category" required value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </FormSection>

        <FormSection title="Content">
          <div className="space-y-4">
            <Input label="Title" value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="Big Dreams Start with Toys" />
            <Textarea label="Subtitle" rows={2} value={values.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Up to 50% Off on Educational Toys" />
            <Input label="CTA Text" value={values.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
          </div>
        </FormSection>

        <FormSection title="Media">
          <div className="space-y-4">
            <ImageListUploadField
              label="Desktop Image"
              folder="banners"
              images={values.desktopImage ? [values.desktopImage] : []}
              onChange={(v) => set("desktopImage", v[0] || "")}
              max={1}
            />
            <ImageListUploadField
              label="Mobile Image"
              folder="banners"
              images={values.mobileImage ? [values.mobileImage] : []}
              onChange={(v) => set("mobileImage", v[0] || "")}
              max={1}
            />
          </div>
        </FormSection>

        <FormSection title="Link">
          <div className="space-y-4">
            <Select label="Link Type" value={values.linkType} onChange={(e) => set("linkType", e.target.value as BannerFormValues["linkType"])}>
              <option value="NONE">No Link</option>
              <option value="PRODUCT">Product</option>
              <option value="CATEGORY">Category</option>
              <option value="URL">Custom URL</option>
            </Select>

            {values.linkType === "PRODUCT" && (
              <Select label="Product" value={values.productId} onChange={(e) => set("productId", e.target.value)}>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </Select>
            )}

            {values.linkType === "CATEGORY" && (
              <Select label="Linked Category" value={values.linkedCategoryId} onChange={(e) => set("linkedCategoryId", e.target.value)}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}

            {values.linkType === "URL" && (
              <Input label="Custom URL" value={values.customUrl} onChange={(e) => set("customUrl", e.target.value)} placeholder="/products or https://..." />
            )}
          </div>
        </FormSection>

        <FormSection title="Scheduling & Priority">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Start Date" type="date" value={values.startDate} onChange={(e) => set("startDate", e.target.value)} hint="Leave blank for no schedule limit" />
            <Input label="End Date" type="date" value={values.endDate} onChange={(e) => set("endDate", e.target.value)} hint="Leave blank for no schedule limit" />
            <Input
              label="Priority"
              type="number"
              value={values.priority}
              onChange={(e) => set("priority", Number(e.target.value))}
              hint="Higher priority banners show first when multiple are active"
            />
            <Select label="Status" value={values.status} onChange={(e) => set("status", e.target.value as "ACTIVE" | "INACTIVE")}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>
        </FormSection>

        <Button type="submit" variant="primary" size="lg" loading={saving}>
          {bannerId ? "Save Changes" : "Create Banner"}
        </Button>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <FormSection title="Live Preview">
          <BannerPreview desktopImage={values.desktopImage} mobileImage={values.mobileImage} title={values.title} subtitle={values.subtitle} ctaText={values.ctaText} />
        </FormSection>
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
