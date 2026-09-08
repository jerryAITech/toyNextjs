import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getSubcategories, listCategories } from "@/lib/services/categoryService";
import { getActiveBanners } from "@/lib/services/bannerService";
import { listProducts, getDistinctBrands } from "@/lib/services/productService";
import { productListQuerySchema } from "@/lib/validation/product";
import { BannerCarousel } from "@/components/site/BannerCarousel";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CategoryCard } from "@/components/site/CategoryCard";
import { ProductFilterPanel } from "@/components/site/ProductFilterPanel";
import { ProductListToolbar } from "@/components/site/ProductListToolbar";
import { InfiniteProductGrid } from "@/components/site/InfiniteProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageSearch } from "lucide-react";

type Params = { slug: string };
type Search = Record<string, string | string[] | undefined>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.seoTitle || category.name,
    description: category.metaDescription || category.description || `Shop ${category.name} at ToyStore.`,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: category.seoTitle || category.name,
      description: category.metaDescription || category.description || undefined,
      images: category.image ? [category.image] : undefined,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category || category.status !== "ACTIVE") notFound();

  const [banners, subcategories, brands, allCategories] = await Promise.all([
    getActiveBanners("CATEGORY", category._id.toString()),
    getSubcategories(category._id.toString()),
    getDistinctBrands(),
    listCategories({ activeOnly: true }),
  ]);

  const flat = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const query = productListQuerySchema.parse({ ...flat, category: slug });
  const { items, total, page, totalPages } = await listProducts(query);

  const categoryOptions = allCategories.map((c) => ({ label: c.name, value: c.slug }));

  const baseParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(query)) {
    if (k === "page" || v === undefined || v === null || v === "") continue;
    baseParams[k] = String(v);
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${process.env.NEXT_PUBLIC_SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: category.name, item: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${category.slug}` },
    ],
  };

  return (
    <div className="px-0 py-4 sm:px-4 sm:py-6 xl:mx-auto xl:max-w-[1600px]">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mb-4 px-4 sm:px-0">
        <Breadcrumbs items={[{ label: category.name }]} />
      </div>

      {banners.length > 0 && (
        <div className="mb-6 px-4 sm:px-0">
          <BannerCarousel banners={JSON.parse(JSON.stringify(banners))} />
        </div>
      )}

      <h1 className="sr-only">{category.name}</h1>
      {(category.tagline || category.description) && (
        <div className="mb-6 px-4 sm:px-0">
          {category.tagline && <p className="text-sm font-medium text-primary-600">{category.tagline}</p>}
          {category.description && <p className="mt-2 max-w-2xl text-sm text-ink-500">{category.description}</p>}
        </div>
      )}

      {subcategories.length > 0 && (
        <div className="mb-6 flex gap-3 overflow-x-auto no-scrollbar">
          <div className="w-4 shrink-0 sm:hidden" aria-hidden="true" />
          {subcategories.map((sc) => (
            <CategoryCard key={sc.slug} name={sc.name} slug={sc.slug} image={sc.image} />
          ))}
          <div className="w-4 shrink-0 sm:hidden" aria-hidden="true" />
        </div>
      )}

      <div className="flex gap-8 px-0 sm:px-0">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-3xl border border-ink-100 bg-white p-4 shadow-soft">
            <ProductFilterPanel key={category.slug} categories={categoryOptions} brands={brands} activeCategory={category.slug} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <ProductListToolbar key={category.slug} categories={categoryOptions} brands={brands} total={total} activeCategory={category.slug} />

          {items.length === 0 ? (
            <div className="px-4 sm:px-0">
              <EmptyState icon={PackageSearch} title="No toys in this category yet" description="Check back soon — new toys are added regularly." actionLabel="Browse All Toys" actionHref="/products" />
            </div>
          ) : (
            <InfiniteProductGrid
              key={category.slug}
              initialItems={JSON.parse(JSON.stringify(items))}
              initialPage={page}
              totalPages={totalPages}
              baseParams={baseParams}
            />
          )}
        </div>
      </div>
    </div>
  );
}
