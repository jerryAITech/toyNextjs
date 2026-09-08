import { connectDB } from "@/lib/db/connect";
import { ProductModel } from "@/lib/models/Product";
import { CategoryModel } from "@/lib/models/Category";
import { slugify, uniqueSlug } from "@/lib/utils/slugify";
import { ApiError } from "@/lib/utils/response";
import type { ProductInput, productListQuerySchema } from "@/lib/validation/product";
import type { z } from "zod";
import type { FilterQuery, PipelineStage } from "mongoose";
import type { Product } from "@/lib/models/Product";

type ListQuery = z.infer<typeof productListQuerySchema>;

// Every sort ends with `_id` as a deterministic tiebreaker — without one, documents that tie on
// the primary key (e.g. many seed products share reviewCount: 0) can be returned more than once
// (or skipped) across paginated `skip`/`limit` requests, since MongoDB doesn't guarantee a stable
// order among ties. That surfaced as duplicate React keys once products were paginated via
// infinite scroll.
const SORT_MAP: Record<ListQuery["sort"], Record<string, 1 | -1>> = {
  popularity: { reviewCount: -1, rating: -1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  rating: { rating: -1, _id: 1 },
  discount: { discountPercent: -1, _id: 1 },
};

export async function listProducts(rawQuery: ListQuery) {
  await connectDB();
  const query: FilterQuery<Product> = { status: "ACTIVE" };

  if (rawQuery.category) {
    const slugs = rawQuery.category.split(",").map((s) => s.trim()).filter(Boolean);
    const cats = await CategoryModel.find({ slug: { $in: slugs } });
    if (cats.length > 0) {
      const ids = cats.map((c) => c._id);
      query.$or = [{ category: { $in: ids } }, { subcategory: { $in: ids } }];
    } else {
      return { items: [], total: 0, page: rawQuery.page, totalPages: 0 };
    }
  }
  if (rawQuery.ageGroup) query.ageGroup = rawQuery.ageGroup;
  if (rawQuery.brand) query.brand = rawQuery.brand;
  if (rawQuery.inStock) query.stock = { $gt: 0 };
  if (rawQuery.minPrice || rawQuery.maxPrice) {
    query.price = {};
    if (rawQuery.minPrice) query.price.$gte = rawQuery.minPrice;
    if (rawQuery.maxPrice) query.price.$lte = rawQuery.maxPrice;
  }
  if (rawQuery.minRating) query.rating = { $gte: rawQuery.minRating };
  if (rawQuery.q) query.$text = { $search: rawQuery.q };
  if (rawQuery.featured) query.isFeatured = true;
  if (rawQuery.trending) query.isTrending = true;
  if (rawQuery.bestseller) query.isBestSeller = true;
  if (rawQuery.new) query.isNewArrival = true;

  const skip = (rawQuery.page - 1) * rawQuery.limit;

  const sortSpec = SORT_MAP[rawQuery.sort];
  let pipeline: PipelineStage[] | null = null;

  if (rawQuery.sort === "discount") {
    pipeline = [
      { $match: query },
      { $addFields: { discountPercent: { $subtract: [100, { $multiply: [{ $divide: ["$price", "$mrp"] }, 100] }] } } },
      { $sort: sortSpec },
      { $skip: skip },
      { $limit: rawQuery.limit },
    ];
  }

  const [items, total] = await Promise.all([
    pipeline
      ? ProductModel.aggregate(pipeline)
      : ProductModel.find(query).sort(sortSpec).skip(skip).limit(rawQuery.limit).populate("category", "name slug").lean(),
    ProductModel.countDocuments(query),
  ]);

  return {
    items,
    total,
    page: rawQuery.page,
    totalPages: Math.max(1, Math.ceil(total / rawQuery.limit)),
  };
}

export async function getDistinctBrands() {
  await connectDB();
  const brands = await ProductModel.distinct("brand", { status: "ACTIVE" });
  return brands.filter(Boolean).sort();
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  return ProductModel.findOne({ slug }).populate("category", "name slug").populate("subcategory", "name slug").lean();
}

export async function getProductById(id: string) {
  await connectDB();
  return ProductModel.findById(id).lean();
}

export async function getFlaggedProducts(
  flag: "isFeatured" | "isBestSeller" | "isTrending" | "isNewArrival",
  limit = 10
) {
  await connectDB();
  return ProductModel.find({ status: "ACTIVE", [flag]: true, stock: { $gt: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getTopDiscountedProducts(limit = 10) {
  await connectDB();
  return ProductModel.aggregate([
    { $match: { status: "ACTIVE", stock: { $gt: 0 } } },
    { $addFields: { discountPercent: { $subtract: [100, { $multiply: [{ $divide: ["$price", "$mrp"] }, 100] }] } } },
    { $match: { discountPercent: { $gte: 10 } } },
    { $sort: { discountPercent: -1 } },
    { $limit: limit },
  ]);
}

export async function getExploreProducts(limit = 30) {
  await connectDB();
  // BSON sort order ranks strings above null, so descending puts videoed products first —
  // the "Explore" reels feed should open on video content before falling back to photos.
  return ProductModel.find({ status: "ACTIVE", stock: { $gt: 0 } })
    .sort({ video: -1, createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getRecommendedProducts(limit = 10) {
  await connectDB();
  return ProductModel.find({ status: "ACTIVE", stock: { $gt: 0 } })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit)
    .lean();
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 8) {
  await connectDB();
  return ProductModel.find({ _id: { $ne: productId }, category: categoryId, status: "ACTIVE" })
    .limit(limit)
    .lean();
}

export async function searchAutocomplete(q: string, limit = 8) {
  await connectDB();
  if (!q.trim()) return [];
  return ProductModel.find({ status: "ACTIVE", $text: { $search: q } })
    .select("name slug images price mrp rating stock")
    .limit(limit)
    .lean();
}

export async function createProduct(input: ProductInput) {
  await connectDB();
  const existingSku = await ProductModel.exists({ sku: input.sku.toUpperCase() });
  if (existingSku) throw new ApiError("A product with this SKU already exists.", 409);

  const slug = input.slug
    ? slugify(input.slug)
    : await uniqueSlug(input.name, async (s) => !!(await ProductModel.exists({ slug: s })));

  return ProductModel.create({ ...input, slug, subcategory: input.subcategory || null });
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  await connectDB();
  const product = await ProductModel.findById(id);
  if (!product) throw new ApiError("Product not found.", 404);

  if (input.images && input.images.length > 5) {
    throw new ApiError("A product can have at most 5 images.", 422);
  }

  if (input.sku && input.sku.toUpperCase() !== product.sku) {
    const clash = await ProductModel.exists({ sku: input.sku.toUpperCase(), _id: { $ne: id } });
    if (clash) throw new ApiError("This SKU is already in use.", 409);
  }

  if (input.slug && input.slug !== product.slug) {
    const newSlug = slugify(input.slug);
    const clash = await ProductModel.exists({ slug: newSlug, _id: { $ne: id } });
    if (clash) throw new ApiError("This slug is already in use.", 409);
    product.slug = newSlug;
  }

  Object.assign(product, { ...input, slug: product.slug, subcategory: input.subcategory === undefined ? product.subcategory : input.subcategory || null });
  await product.save();
  return product;
}

export async function deleteProduct(id: string) {
  await connectDB();
  await ProductModel.findByIdAndDelete(id);
}

export async function setProductStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  await connectDB();
  const product = await ProductModel.findByIdAndUpdate(id, { status }, { new: true });
  if (!product) throw new ApiError("Product not found.", 404);
  return product;
}

export async function setProductFlag(
  id: string,
  flag: "isFeatured" | "isBestSeller" | "isTrending" | "isNewArrival",
  value: boolean
) {
  await connectDB();
  const product = await ProductModel.findByIdAndUpdate(id, { [flag]: value }, { new: true });
  if (!product) throw new ApiError("Product not found.", 404);
  return product;
}

export async function adjustStock(id: string, stock: number) {
  await connectDB();
  const product = await ProductModel.findByIdAndUpdate(id, { stock }, { new: true });
  if (!product) throw new ApiError("Product not found.", 404);
  return product;
}
