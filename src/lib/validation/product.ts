import { z } from "zod";
import { AGE_GROUPS } from "@/lib/models/Product";

const specSchema = z.object({ key: z.string().trim().min(1), value: z.string().trim().min(1) });

export const productSchema = z.object({
  name: z.string().trim().min(2).max(140),
  slug: z.string().trim().optional(),
  sku: z.string().trim().min(2).max(40),
  brand: z.string().trim().optional().or(z.literal("")),
  category: z.string().trim().min(1, "Category is required"),
  subcategory: z.string().trim().nullable().optional(),

  price: z.coerce.number().min(0),
  mrp: z.coerce.number().min(0),

  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),

  ageGroup: z.enum(AGE_GROUPS),
  description: z.string().trim().optional().or(z.literal("")),
  highlights: z.array(z.string().trim()).default([]),
  specifications: z.array(specSchema).default([]),
  material: z.string().trim().optional().or(z.literal("")),
  dimensions: z.string().trim().optional().or(z.literal("")),
  safetyInformation: z.string().trim().optional().or(z.literal("")),
  whatsIncluded: z.array(z.string().trim()).default([]),
  manufacturer: z.string().trim().optional().or(z.literal("")),

  images: z.array(z.string()).max(5, "A product can have at most 5 images.").default([]),
  video: z.string().nullable().optional(),

  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
  keywords: z.array(z.string().trim()).default([]),
  canonicalUrl: z.string().trim().optional().or(z.literal("")),
  ogTitle: z.string().trim().optional().or(z.literal("")),
  ogDescription: z.string().trim().optional().or(z.literal("")),
  ogImage: z.string().trim().optional().or(z.literal("")),

  codAvailable: z.boolean().default(true),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(20),
  category: z.string().optional(),
  ageGroup: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  discount: z.coerce.number().optional(),
  sort: z.enum(["popularity", "newest", "price_asc", "price_desc", "rating", "discount"]).default("popularity"),
  q: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  trending: z.coerce.boolean().optional(),
  bestseller: z.coerce.boolean().optional(),
  new: z.coerce.boolean().optional(),
});
