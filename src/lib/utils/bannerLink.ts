type PopulatedRef = { slug?: string } | string | null | undefined;

export function resolveBannerHref(banner: {
  linkType?: string | null;
  productId?: PopulatedRef;
  linkedCategoryId?: PopulatedRef;
  customUrl?: string | null;
}): string | null {
  if (banner.linkType === "PRODUCT" && banner.productId && typeof banner.productId === "object" && banner.productId.slug) {
    return `/product/${banner.productId.slug}`;
  }
  if (banner.linkType === "CATEGORY" && banner.linkedCategoryId && typeof banner.linkedCategoryId === "object" && banner.linkedCategoryId.slug) {
    return `/category/${banner.linkedCategoryId.slug}`;
  }
  if (banner.linkType === "URL" && banner.customUrl) {
    return banner.customUrl;
  }
  return null;
}
