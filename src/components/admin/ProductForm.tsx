"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageListUploadField, VideoUploadField } from "@/components/admin/MediaUploadField";
import { TagListInput, SpecListInput } from "@/components/admin/ListInputs";
import { useToast } from "@/context/ToastContext";
import { AGE_GROUP_LABELS } from "@/lib/utils/ageGroups";

type Category = { _id: string; name: string; parentCategory: string | null };

export type ProductFormValues = {
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  mrp: number;
  stock: number;
  lowStockThreshold: number;
  ageGroup: string;
  description: string;
  highlights: string[];
  specifications: { key: string; value: string }[];
  material: string;
  dimensions: string;
  safetyInformation: string;
  whatsIncluded: string[];
  manufacturer: string;
  images: string[];
  video: string | null;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  codAvailable: boolean;
  status: "ACTIVE" | "INACTIVE";
  isFeatured: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
};

export const EMPTY_PRODUCT: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  brand: "ToyStore",
  category: "",
  subcategory: "",
  price: 0,
  mrp: 0,
  stock: 0,
  lowStockThreshold: 5,
  ageGroup: "3-5",
  description: "",
  highlights: [],
  specifications: [],
  material: "",
  dimensions: "",
  safetyInformation: "",
  whatsIncluded: [],
  manufacturer: "",
  images: [],
  video: null,
  seoTitle: "",
  metaDescription: "",
  keywords: [],
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  codAvailable: true,
  status: "ACTIVE",
  isFeatured: false,
  isBestSeller: false,
  isTrending: false,
  isNewArrival: false,
};

export function ProductForm({ productId, initial }: { productId?: string; initial?: Partial<ProductFormValues> }) {
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY_PRODUCT, ...initial });
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((json) => setCategories(json.data?.categories ?? []));
  }, []);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const topLevelCategories = categories.filter((c) => !c.parentCategory);
  const subcategories = categories.filter((c) => c.parentCategory === values.category);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, subcategory: values.subcategory || null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Could not save product");
      showToast(productId ? "Product updated" : "Product created", "success");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save product", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">
      <FormSection title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Product Name" required value={values.name} onChange={(e) => set("name", e.target.value)} />
          <Input label="SKU" required value={values.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} />
          <Input label="Slug" value={values.slug} onChange={(e) => set("slug", e.target.value)} hint="Leave blank to auto-generate from name" />
          <Input label="Brand" value={values.brand} onChange={(e) => set("brand", e.target.value)} />
          <Select label="Category" required value={values.category} onChange={(e) => { set("category", e.target.value); set("subcategory", ""); }}>
            <option value="">Select category</option>
            {topLevelCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select label="Subcategory" value={values.subcategory} onChange={(e) => set("subcategory", e.target.value)}>
            <option value="">None</option>
            {subcategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select label="Age Group" required value={values.ageGroup} onChange={(e) => set("ageGroup", e.target.value)}>
            {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input label="Manufacturer" value={values.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} />
        </div>
      </FormSection>

      <FormSection title="Pricing & Inventory">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="MRP (₹)" type="number" required min={0} value={values.mrp} onChange={(e) => set("mrp", Number(e.target.value))} />
          <Input label="Selling Price (₹)" type="number" required min={0} value={values.price} onChange={(e) => set("price", Number(e.target.value))} />
          <Input label="Stock" type="number" required min={0} value={values.stock} onChange={(e) => set("stock", Number(e.target.value))} />
          <Input
            label="Low Stock Threshold"
            type="number"
            min={0}
            value={values.lowStockThreshold}
            onChange={(e) => set("lowStockThreshold", Number(e.target.value))}
          />
        </div>
      </FormSection>

      <FormSection title="Content">
        <div className="space-y-4">
          <Textarea label="Description" rows={4} value={values.description} onChange={(e) => set("description", e.target.value)} />
          <TagListInput label="Highlights" items={values.highlights} onChange={(v) => set("highlights", v)} placeholder="Add a highlight and press Enter" />
          <SpecListInput items={values.specifications} onChange={(v) => set("specifications", v)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Material" value={values.material} onChange={(e) => set("material", e.target.value)} />
            <Input label="Dimensions" value={values.dimensions} onChange={(e) => set("dimensions", e.target.value)} />
          </div>
          <Textarea label="Safety Information" rows={2} value={values.safetyInformation} onChange={(e) => set("safetyInformation", e.target.value)} />
          <TagListInput label="What's Included" items={values.whatsIncluded} onChange={(v) => set("whatsIncluded", v)} placeholder="Add an item and press Enter" />
        </div>
      </FormSection>

      <FormSection title="Media">
        <div className="space-y-4">
          <ImageListUploadField label="Product Images" folder="products" images={values.images} onChange={(v) => set("images", v)} max={5} />
          <VideoUploadField label="Product Video" folder="products" video={values.video} onChange={(v) => set("video", v)} />
        </div>
      </FormSection>

      <FormSection title="SEO">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="SEO Title" value={values.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
          <Input label="Canonical URL" value={values.canonicalUrl} onChange={(e) => set("canonicalUrl", e.target.value)} />
        </div>
        <Textarea className="mt-4" label="Meta Description" rows={2} value={values.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
        <div className="mt-4">
          <TagListInput label="Focus Keywords" items={values.keywords} onChange={(v) => set("keywords", v)} placeholder="Add a keyword and press Enter" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="OG Title" value={values.ogTitle} onChange={(e) => set("ogTitle", e.target.value)} />
          <Input label="OG Image URL" value={values.ogImage} onChange={(e) => set("ogImage", e.target.value)} />
        </div>
        <Textarea className="mt-4" label="OG Description" rows={2} value={values.ogDescription} onChange={(e) => set("ogDescription", e.target.value)} />
      </FormSection>

      <FormSection title="Status & Merchandising">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Status" value={values.status} onChange={(e) => set("status", e.target.value as "ACTIVE" | "INACTIVE")}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" checked={values.codAvailable} onChange={(e) => set("codAvailable", e.target.checked)} className="size-4 rounded accent-primary-500" />
            COD Available
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          {(
            [
              ["isFeatured", "Featured"],
              ["isBestSeller", "Best Seller"],
              ["isTrending", "Trending"],
              ["isNewArrival", "New Arrival"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="checkbox" checked={values[key]} onChange={(e) => set(key, e.target.checked)} className="size-4 rounded accent-primary-500" />
              {label}
            </label>
          ))}
        </div>
      </FormSection>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="lg" loading={saving}>
          {productId ? "Save Changes" : "Create Product"}
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
