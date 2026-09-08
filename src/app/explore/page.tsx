import type { Metadata } from "next";
import { getExploreProducts } from "@/lib/services/productService";
import { ExploreFeed } from "@/components/site/ExploreFeed";

export const metadata: Metadata = {
  title: "Explore",
  description: "Swipe through trending toys in a video-first, reels-style feed.",
};

export const revalidate = 60;

export default async function ExplorePage() {
  const products = await getExploreProducts(30);

  return <ExploreFeed products={JSON.parse(JSON.stringify(products))} />;
}
