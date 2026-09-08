import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/services/categoryService";
import { CategoryForm, type CategoryFormValues } from "@/components/admin/CategoryForm";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  const initial: Partial<CategoryFormValues> = {
    name: category.name,
    slug: category.slug,
    tagline: category.tagline || "",
    description: category.description || "",
    image: category.image || "",
    parentCategory: category.parentCategory ? category.parentCategory.toString() : "",
    displayOrder: category.displayOrder ?? 0,
    seoTitle: category.seoTitle || "",
    metaDescription: category.metaDescription || "",
    status: category.status as "ACTIVE" | "INACTIVE",
  };

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-bold text-ink-900">Edit Category</h1>
      <CategoryForm categoryId={id} initial={initial} />
    </div>
  );
}
