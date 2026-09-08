import type { Metadata } from "next";
import { listProducts, getDistinctBrands } from "@/lib/services/productService";
import { listCategories } from "@/lib/services/categoryService";
import { productListQuerySchema } from "@/lib/validation/product";
import { ProductFilterPanel } from "@/components/site/ProductFilterPanel";
import { ProductListToolbar } from "@/components/site/ProductListToolbar";
import { InfiniteProductGrid } from "@/components/site/InfiniteProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Shop All Toys",
  description: "Browse our full range of toys — educational, action figures, dolls, building blocks and more.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const flat = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));

  const query = productListQuerySchema.parse(flat);
  const [{ items, total, page, totalPages }, categories, brands] = await Promise.all([
    listProducts(query),
    listCategories({ activeOnly: true }),
    getDistinctBrands(),
  ]);

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.slug }));

  const baseParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(query)) {
    if (k === "page" || v === undefined || v === null || v === "") continue;
    baseParams[k] = String(v);
  }

  return (
    <div className="px-0 py-6 sm:px-4 xl:mx-auto xl:max-w-[1600px]">
      <h1 className="mb-4 px-4 font-display text-xl font-bold text-ink-900 sm:px-0 sm:text-2xl">
        {query.q ? `Search results for "${query.q}"` : "Shop All Toys"}
      </h1>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-3xl border border-ink-100 bg-white p-4 shadow-soft">
            <ProductFilterPanel categories={categoryOptions} brands={brands} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <ProductListToolbar categories={categoryOptions} brands={brands} total={total} />

          {items.length === 0 ? (
            <div className="px-4 sm:px-0">
              <EmptyState icon={SearchX} title="No toys found" description="Try adjusting your filters or search terms." actionLabel="Clear Filters" actionHref="/products" />
            </div>
          ) : (
            <InfiniteProductGrid
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
