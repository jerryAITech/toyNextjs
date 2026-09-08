import { connectDB } from "@/lib/db/connect";
import { CategoryModel } from "@/lib/models/Category";
import { ProductModel } from "@/lib/models/Product";
import { slugify, uniqueSlug } from "@/lib/utils/slugify";
import { ApiError } from "@/lib/utils/response";
import type { CategoryInput } from "@/lib/validation/category";

export async function listCategories({ activeOnly = false, topLevelOnly = false } = {}) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (activeOnly) query.status = "ACTIVE";
  if (topLevelOnly) query.parentCategory = null;
  return CategoryModel.find(query).sort({ displayOrder: 1, name: 1 }).lean();
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();
  return CategoryModel.findOne({ slug }).lean();
}

export async function getSubcategories(parentId: string) {
  await connectDB();
  return CategoryModel.find({ parentCategory: parentId, status: "ACTIVE" }).sort({ displayOrder: 1, name: 1 }).lean();
}

export async function getCategoryById(id: string) {
  await connectDB();
  return CategoryModel.findById(id).lean();
}

export async function createCategory(input: CategoryInput) {
  await connectDB();
  const slug = input.slug
    ? slugify(input.slug)
    : await uniqueSlug(input.name, async (s) => !!(await CategoryModel.exists({ slug: s })));

  return CategoryModel.create({ ...input, slug, parentCategory: input.parentCategory || null });
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  await connectDB();
  const category = await CategoryModel.findById(id);
  if (!category) throw new ApiError("Category not found.", 404);

  if (input.slug && input.slug !== category.slug) {
    const newSlug = slugify(input.slug);
    const clash = await CategoryModel.exists({ slug: newSlug, _id: { $ne: id } });
    if (clash) throw new ApiError("This slug is already in use.", 409);
    category.slug = newSlug;
  }

  Object.assign(category, {
    ...input,
    slug: category.slug,
    parentCategory: input.parentCategory === undefined ? category.parentCategory : input.parentCategory || null,
  });
  await category.save();
  return category;
}

export async function deleteCategory(id: string) {
  await connectDB();
  const productCount = await ProductModel.countDocuments({ category: id });
  if (productCount > 0) {
    throw new ApiError(`Cannot delete: ${productCount} product(s) still belong to this category.`, 409);
  }
  await CategoryModel.findByIdAndDelete(id);
}
