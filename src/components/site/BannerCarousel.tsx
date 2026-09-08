"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { resolveBannerHref } from "@/lib/utils/bannerLink";

export type BannerData = {
  _id: string;
  title?: string | null;
  subtitle?: string | null;
  desktopImage: string;
  mobileImage: string;
  ctaText?: string | null;
  linkType?: string | null;
  productId?: { slug?: string } | string | null;
  linkedCategoryId?: { slug?: string } | string | null;
  customUrl?: string | null;
};

function BannerSlide({ banner, priority }: { banner: BannerData; priority?: boolean }) {
  const href = resolveBannerHref(banner);

  const content = (
    <div className="relative aspect-[16/7] w-full overflow-hidden bg-ink-100 sm:aspect-[21/7] md:aspect-[3/1]">
      <Image src={banner.desktopImage} alt={banner.title || "Promotional banner"} fill priority={priority} sizes="100vw" className="hidden object-cover md:block" />
      <Image src={banner.mobileImage} alt={banner.title || "Promotional banner"} fill priority={priority} sizes="100vw" className="object-cover md:hidden" />

      {(banner.title || banner.subtitle) && (
        <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-gradient-to-r from-black/40 via-black/10 to-transparent p-6 sm:p-10">
          {banner.title && <h2 className="font-display text-xl font-extrabold text-white drop-shadow sm:text-3xl md:text-4xl">{banner.title}</h2>}
          {banner.subtitle && <p className="max-w-xs text-sm text-white/90 sm:text-base">{banner.subtitle}</p>}
          {banner.ctaText && (
            <span className="mt-2 inline-flex w-fit items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink-900 shadow-soft">
              {banner.ctaText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function BannerCarousel({ banners }: { banners: BannerData[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: banners.length > 1 });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || banners.length <= 1) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi, banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner, i) => (
            <div key={banner._id} className="min-w-0 flex-[0_0_100%]">
              <BannerSlide banner={banner} priority={i === 0} />
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute inset-x-0 bottom-1 flex justify-center">
          {banners.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className="flex size-7 items-center justify-center"
            >
              <span className={cn("h-1.5 rounded-full transition-all", i === selected ? "w-5 bg-primary-500" : "w-1.5 bg-ink-200")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
