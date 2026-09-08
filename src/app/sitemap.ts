import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db/connect";
import { ProductModel } from "@/lib/models/Product";
import { CategoryModel } from "@/lib/models/Category";

const STATIC_ROUTES = [
  "",
  "/products",
  "/about",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/shipping",
  "/return",
  "/refund",
  "/cancellation",
  "/login",
  "/signup",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await connectDB();
  const [products, categories] = await Promise.all([
    ProductModel.find({ status: "ACTIVE" }).select("slug updatedAt").lean(),
    CategoryModel.find({ status: "ACTIVE" }).select("slug updatedAt").lean(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.6,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/category/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
