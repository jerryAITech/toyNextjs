"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageListUploadField } from "@/components/admin/MediaUploadField";
import { useToast } from "@/context/ToastContext";

type ParentCategory = { _id: string; name: string; parentCategory: string | null };

export type CategoryFormValues = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  parentCategory: string;
  displayOrder: number;
  seoTitle: string;
  metaDescription: string;
  status: "ACTIVE" | "INACTIVE";
};

export const EMPTY_CATEGORY: CategoryFormValues = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  image: "",
  parentCategory: "",
  displayOrder: 0,
  seoTitle: "",
  metaDescription: "",
  status: "ACTIVE",
};

export function CategoryForm({ categoryId, initial }: { categoryId?: string; initial?: Partial<CategoryFormValues> }) {
  const [values, setValues] = useState<CategoryFormValues>({ ...EMPTY_CATEGORY, ...initial });
  const [parentOptions, setParentOptions] = useState<ParentCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((json) => {
        const all: ParentCategory[] = json.data?.categories ?? [];
        setParentOptions(all.filter((c) => !c.parentCategory && c._id !== categoryId));
      });
  }, [categoryId]);

  function set<K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(categoryId ? `/api/admin/categories/${categoryId}` : "/api/admin/categories", {
        method: categoryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, parentCategory: values.parentCategory || null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Could not save category");
      showToast(categoryId ? "Category updated" : "Category created", "success");
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save category", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">
      <FormSection title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" required value={values.name} onChange={(e) => set("name", e.target.value)} />
          <Input label="Slug" value={values.slug} onChange={(e) => set("slug", e.target.value)} hint="Leave blank to auto-generate from name" />
          <Input label="Tagline" value={values.tagline} onChange={(e) => set("tagline", e.target.value)} hint='Shown on category banners, e.g. "Learn • Build • Grow"' />
          <Select label="Parent Category" value={values.parentCategory} onChange={(e) => set("parentCategory", e.target.value)}>
            <option value="">None / Top Level</option>
            {parentOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input label="Display Order" type="number" value={values.displayOrder} onChange={(e) => set("displayOrder", Number(e.target.value))} />
          <Select label="Status" value={values.status} onChange={(e) => set("status", e.target.value as "ACTIVE" | "INACTIVE")}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
        <Textarea className="mt-4" label="Description" rows={4} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </FormSection>

      <FormSection title="Media">
        <ImageListUploadField
          label="Category Image"
          folder="categories"
          images={values.image ? [values.image] : []}
          onChange={(next) => set("image", next[0] || "")}
          max={1}
        />
      </FormSection>

      <FormSection title="SEO">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="SEO Title" value={values.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
        </div>
        <Textarea className="mt-4" label="Meta Description" rows={2} value={values.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
      </FormSection>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="lg" loading={saving}>
          {categoryId ? "Save Changes" : "Create Category"}
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
