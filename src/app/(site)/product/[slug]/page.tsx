import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/productService";
import { getSettings } from "@/lib/services/settingsService";
import { ProductGallery } from "@/components/site/ProductGallery";
import { ProductActions } from "@/components/site/ProductActions";
import { ProductReviews } from "@/components/site/ProductReviews";
import { ProductCard } from "@/components/site/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/site/SectionHeading";
import { formatINR } from "@/lib/utils/pricing";
import { AGE_GROUP_LABELS } from "@/lib/utils/ageGroups";
import { Truck, ShieldCheck, RotateCcw, Banknote } from "lucide-react";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = product.seoTitle || `${product.name} | ${product.brand}`;
  const description = product.metaDescription || product.description?.slice(0, 155) || `Buy ${product.name} online at ToyStore.`;
  const image = product.ogImage || product.images[0];

  return {
    title,
    description,
    alternates: { canonical: product.canonicalUrl || `/product/${product.slug}` },
    keywords: product.keywords,
    openGraph: {
      title: product.ogTitle || title,
      description: product.ogDescription || description,
      images: image ? [image] : undefined,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "ACTIVE") notFound();

  const category = product.category as unknown as { _id: string; name: string; slug: string };
  const [related, settings] = await Promise.all([
    getRelatedProducts(product._id.toString(), category._id.toString()),
    getSettings(),
  ]);

  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const stockLabel = product.stock <= 0 ? "Out of Stock" : product.stock <= product.lowStockThreshold ? `Only ${product.stock} left` : "In Stock";
  const stockTone = product.stock <= 0 ? "danger" : product.stock <= product.lowStockThreshold ? "warning" : "success";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    ...(product.reviewCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: category.name, item: `${siteUrl}/category/${category.slug}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${siteUrl}/product/${product.slug}` },
    ],
  };

  return (
    <div className="px-4 py-4 pb-36 sm:py-6 sm:pb-10 xl:mx-auto xl:max-w-[1600px]">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mb-4">
        <Breadcrumbs items={[{ label: category.name, href: `/category/${category.slug}` }, { label: product.name }]} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} video={product.video} name={product.name} />

        <div>
          {product.brand && <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">{product.brand}</p>}
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">{product.name}</h1>

          <div className="mt-2 flex items-center gap-3">
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1.5">
                <StarRating rating={product.rating} />
                <span className="text-sm text-ink-500">({product.reviewCount} reviews)</span>
              </div>
            )}
            <span className="text-xs text-ink-400">SKU: {product.sku}</span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-ink-900">{formatINR(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-ink-400 line-through">{formatINR(product.mrp)}</span>
                <Badge tone="accent">{discount}% OFF</Badge>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={stockTone as "success" | "warning" | "danger"}>{stockLabel}</Badge>
            <Badge tone="neutral">Age: {AGE_GROUP_LABELS[product.ageGroup]}</Badge>
          </div>

          <div className="mt-6">
            <ProductActions productId={product._id.toString()} stock={product.stock} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-ink-50 p-4 text-sm text-ink-600 sm:grid-cols-4">
            <InfoTile icon={Truck} label="3-5 day delivery" />
            <InfoTile icon={ShieldCheck} label="Safety tested" />
            <InfoTile icon={RotateCcw} label="7-day returns" />
            <InfoTile icon={Banknote} label={product.codAvailable && settings.codEnabled ? "COD available" : "Prepaid only"} />
          </div>

          {product.highlights.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-ink-800">Highlights</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-600">
                {product.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {product.description && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-ink-800">Description</h2>
              <p className="whitespace-pre-line text-sm text-ink-600">{product.description}</p>
            </div>
          )}

          <div className="mt-6 space-y-1 text-sm text-ink-600">
            {product.material && <DetailRow label="Material" value={product.material} />}
            {product.dimensions && <DetailRow label="Dimensions" value={product.dimensions} />}
            {product.manufacturer && <DetailRow label="Manufacturer" value={product.manufacturer} />}
          </div>

          {product.specifications.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-ink-800">Specifications</h2>
              <div className="overflow-hidden rounded-2xl border border-ink-100">
                {product.specifications.map((s, i) => (
                  <div key={i} className={`flex justify-between px-4 py-2 text-sm ${i % 2 === 0 ? "bg-ink-50" : "bg-white"}`}>
                    <span className="text-ink-500">{s.key}</span>
                    <span className="font-medium text-ink-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.whatsIncluded.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-ink-800">What&apos;s Included</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-600">
                {product.whatsIncluded.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {product.safetyInformation && (
            <div className="mt-6 rounded-2xl bg-sun-100 p-4 text-sm text-ink-700">
              <h2 className="mb-1 font-semibold">Safety Information</h2>
              <p>{product.safetyInformation}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <SectionHeading title="Ratings & Reviews" />
        <ProductReviews slug={product.slug} />
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <SectionHeading title="You May Also Like" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={String(p._id)} product={JSON.parse(JSON.stringify(p))} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTile({ icon: Icon, label }: { icon: typeof Truck; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon size={18} className="text-primary-500" />
      <span className="text-xs">{label}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-28 shrink-0 text-ink-400">{label}</span>
      <span className="font-medium text-ink-700">{value}</span>
    </div>
  );
}
