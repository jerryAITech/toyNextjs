import type { Metadata } from "next";
import { getActiveBanners } from "@/lib/services/bannerService";
import { listCategories } from "@/lib/services/categoryService";
import { getFlaggedProducts } from "@/lib/services/productService";
import { getRecentApprovedReviews } from "@/lib/services/reviewService";
import Image from "next/image";
import Link from "next/link";
import { BannerCarousel } from "@/components/site/BannerCarousel";
import { DefaultHero } from "@/components/site/Hero";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { HorizontalScroller, ProductScrollerItem, CategoryScrollerItem } from "@/components/site/HorizontalScroller";
import { ShopByPurpose } from "@/components/site/ShopByPurpose";
import { PromoBanner } from "@/components/site/PromoBanner";
import { ArrowRight } from "lucide-react";
import { TrustFeatures } from "@/components/site/TrustFeatures";
import { CustomerReviews } from "@/components/site/CustomerReviews";

export const metadata: Metadata = {
  // The root layout's title template appends " | ToyStore" to every page — bypass it here with
  // an absolute title so the homepage's <title> doesn't end up saying "ToyStore ... | ToyStore".
  title: { absolute: "ToyStore — Premium Toys for Every Age" },
  description: "Shop educational toys, action figures, dolls, building blocks and more at ToyStore. Fast delivery, secure payments, and toys parents trust.",
};

export const revalidate = 60;

// Homepage rails (Trending/Featured/New Arrivals/Best Sellers) are fetched with a wider net (16
// each) and then deduped in display order so the same product doesn't repeat across every rail —
// a product flagged both isTrending and isFeatured, say, should only show up once.
function dedupeAcross(lists: { _id: string }[][], perList: number) {
  const seen = new Set<string>();
  return lists.map((list) => {
    const out: typeof list = [];
    for (const p of list) {
      const id = String(p._id);
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(p);
      if (out.length === perList) break;
    }
    return out;
  });
}

export default async function HomePage() {
  const [homeBanners, categories, trendingRaw, featuredRaw, newArrivalsRaw, bestSellersRaw, reviews] = await Promise.all([
    getActiveBanners("HOME"),
    listCategories({ activeOnly: true, topLevelOnly: true }),
    // Trimmed from 10/10/10/8 — the Lighthouse audit flagged the home page's DOM at 1,918
    // elements (over its 1,500-element guideline); each product card is ~30-plus nodes once its
    // star rating icons are counted, so shaving a couple of cards per rail adds up fast without
    // visibly thinning any section out. Fetched wider (16) than displayed (8) so dedupeAcross has
    // room to drop cross-rail duplicates without starving a later rail.
    getFlaggedProducts("isTrending", 16),
    getFlaggedProducts("isFeatured", 16),
    getFlaggedProducts("isNewArrival", 16),
    getFlaggedProducts("isBestSeller", 16),
    getRecentApprovedReviews(6),
  ]);

  const [trending, featured, newArrivals, bestSellers] = dedupeAcross(
    [trendingRaw, featuredRaw, newArrivalsRaw, bestSellersRaw],
    8
  );

  return (
    <>
      <div className="flex flex-col gap-8 pb-4 sm:gap-12 sm:pb-8">
        {homeBanners.length > 0 ? <BannerCarousel banners={JSON.parse(JSON.stringify(homeBanners))} /> : <DefaultHero />}

        <section className="w-full px-4 xl:mx-auto xl:max-w-[1600px]">
          <TrustFeatures variant="strip" />
        </section>

        <section id="categories" className="w-full scroll-mt-20 sm:px-4 xl:mx-auto xl:max-w-[1600px]">
          <SectionHeading title="Shop by Category" subtitle="Explore our wide range of toys" />
          <HorizontalScroller showArrows>
            {categories.map((c) => (
              <CategoryScrollerItem key={c.slug}>
                <FeaturedCategoryCard name={c.name} slug={c.slug} image={c.image} />
              </CategoryScrollerItem>
            ))}
          </HorizontalScroller>
        </section>

        {trending.length > 0 && <ProductSection title="Trending Toys" subtitle="What everyone's playing with" products={trending} />}

        {featured.length > 0 && <ProductSection title="Featured Products" subtitle="Hand-picked toys we love" products={featured} />}

        {newArrivals.length > 0 && <ProductSection title="New Arrivals" subtitle="Fresh off the shelf" products={newArrivals} />}

        {bestSellers.length > 0 && (
          <ProductSection title="Best Sellers" subtitle="Customer favorites, loved by kids" products={bestSellers} />
        )}

        <section className="w-full sm:px-4 xl:mx-auto xl:max-w-[1600px]">
          <PromoBanner />
        </section>

        <section className="w-full sm:px-4 xl:mx-auto xl:max-w-[1600px]">
          <SectionHeading title="Shop by Purpose" subtitle="Choose toys that match your child's interests" />
          <ShopByPurpose />
        </section>

        <section className="w-full sm:px-4 xl:mx-auto xl:max-w-[1600px]">
          <SectionHeading title="Why Parents Love ToyStore" />
          <TrustFeatures variant="cards" />
        </section>

        {reviews.length > 0 && (
          <section className="w-full sm:px-4 xl:mx-auto xl:max-w-[1600px]">
            <SectionHeading title="What Parents Are Saying" />
            <CustomerReviews reviews={JSON.parse(JSON.stringify(reviews))} />
          </section>
        )}
      </div>
    </>
  );
}

function FeaturedCategoryCard({ name, slug, image }: { name: string; slug: string; image?: string | null }) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 38vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">🧸</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>

      <div className="relative flex flex-1 items-center justify-between gap-1.5 overflow-hidden px-2.5 py-2">
        {/* Same decorative-blob motif as TrustFeatures/product cards, scaled down for this tighter footer strip. */}
        <svg
          className="pointer-events-none absolute -right-5 -top-7 h-14 w-14 text-primary-50"
          viewBox="0 0 200 200"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M44.9,-58.3C57.7,-49.4,67,-34.9,71.3,-19C75.6,-3.1,74.9,14.2,67.8,28.6C60.7,43,47.2,54.5,32.1,62C17,69.5,0.3,73,-16.4,71.3C-33.1,69.6,-49.8,62.7,-60.6,50.1C-71.4,37.5,-76.3,19.2,-76.1,1.2C-75.9,-16.9,-70.6,-33.8,-59.9,-43.4C-49.2,-53,-33.1,-55.3,-18.6,-62.5C-4.1,-69.7,8.8,-81.8,21.9,-79.9C35,-78,44.9,-67.2,44.9,-58.3Z" />
        </svg>
        <span className="relative z-10 line-clamp-2 font-display text-xs font-semibold text-ink-900 sm:text-sm">{name}</span>
        <ArrowRight
          size={14}
          className="relative z-10 shrink-0 text-primary-400 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </div>
    </Link>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle?: string;
  products: unknown[];
}) {
  return (
    <section className="w-full sm:px-4 xl:mx-auto xl:max-w-[1600px]">
      <div className="mb-4 flex items-end justify-between gap-3 px-4 sm:px-0">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900 sm:text-2xl">{title}</h2>
          {subtitle && <p className="text-xs text-ink-400 sm:text-sm">{subtitle}</p>}
        </div>
        <Link href="/products" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary-600 hover:underline sm:flex">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <HorizontalScroller showArrows>
        {(products as { _id: string }[]).map((p) => (
          <ProductScrollerItem key={p._id.toString()}>
            <ProductCard product={JSON.parse(JSON.stringify(p))} />
          </ProductScrollerItem>
        ))}
      </HorizontalScroller>
    </section>
  );
}
