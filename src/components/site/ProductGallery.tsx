"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { PlayCircle, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ProductGallery({ images, video, name }: { images: string[]; video?: string | null; name: string }) {
  const slides = video ? [...images, "__video__"] : images;

  // Two independent Embla instances (not one ref shared across the mobile/desktop markup) — both
  // layouts are always mounted at once and toggled with `md:hidden`/`hidden md:flex`, so a single
  // shared ref would only ever attach to whichever container renders last (desktop), leaving the
  // visible mobile carousel with no drag/swipe handlers bound to it at all.
  const [mobileRef, mobileApi] = useEmblaCarousel({ loop: false });
  const [desktopRef, desktopApi] = useEmblaCarousel({ loop: false });
  const [selected, setSelected] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mobileApi) return;
    const onSelect = () => setSelected(mobileApi.selectedScrollSnap());
    onSelect();
    mobileApi.on("select", onSelect);
  }, [mobileApi]);

  useEffect(() => {
    if (!desktopApi) return;
    const onSelect = () => setSelected(desktopApi.selectedScrollSnap());
    onSelect();
    desktopApi.on("select", onSelect);
  }, [desktopApi]);

  const openZoom = useCallback(() => setZoomOpen(true), []);

  if (slides.length === 0) {
    return <div className="aspect-square w-full rounded-2xl bg-ink-100" />;
  }

  return (
    <div>
      {/* Mobile: swipeable */}
      <div className="relative md:hidden">
        <div className="overflow-hidden rounded-2xl" ref={mobileRef}>
          <div className="flex">
            {slides.map((src, i) => (
              <div key={i} className="relative aspect-square min-w-0 flex-[0_0_100%] bg-ink-50" onClick={() => src !== "__video__" && openZoom()}>
                {src === "__video__" ? (
                  <video src={video!} controls preload="metadata" className="h-full w-full object-cover" />
                ) : (
                  <Image src={src} alt={`${name} — image ${i + 1}`} fill sizes="100vw" className="object-cover" priority={i === 0} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          {selected + 1} / {slides.length}
        </div>
        {slides[selected] !== "__video__" && (
          <button
            type="button"
            aria-label="Zoom image"
            onClick={openZoom}
            className="absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <ZoomIn size={16} />
          </button>
        )}
      </div>

      {/* Desktop: thumbnails + main */}
      <div className="hidden gap-3 md:flex">
        <div className="flex flex-col gap-2">
          {slides.map((src, i) => (
            <button
              key={i}
              onClick={() => desktopApi?.scrollTo(i)}
              className={cn(
                "relative size-16 overflow-hidden rounded-xl border-2 bg-ink-50",
                selected === i ? "border-primary-500" : "border-transparent"
              )}
            >
              {src === "__video__" ? (
                <div className="flex h-full items-center justify-center bg-ink-800 text-white">
                  <PlayCircle size={20} />
                </div>
              ) : (
                <Image src={src} alt={`${name} thumbnail ${i + 1}`} fill sizes="64px" className="object-cover" />
              )}
            </button>
          ))}
        </div>

        <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl bg-ink-50" ref={desktopRef}>
          <div className="flex h-full">
            {slides.map((src, i) => (
              <div
                key={i}
                className={cn("relative h-full min-w-0 flex-[0_0_100%]", src !== "__video__" && "cursor-zoom-in")}
                onClick={() => src !== "__video__" && openZoom()}
              >
                {src === "__video__" ? (
                  <video src={video!} controls preload="metadata" className="h-full w-full object-cover" />
                ) : (
                  <Image src={src} alt={`${name} — image ${i + 1}`} fill sizes="500px" className="object-contain" priority={i === 0} />
                )}
              </div>
            ))}
          </div>
          {slides[selected] !== "__video__" && (
            <button
              type="button"
              aria-label="Zoom image"
              onClick={openZoom}
              className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
            >
              <ZoomIn size={16} />
            </button>
          )}
        </div>
      </div>

      {mounted &&
        zoomOpen &&
        createPortal(
          <ImageZoomViewer images={images} initialIndex={Math.min(selected, images.length - 1)} name={name} onClose={() => setZoomOpen(false)} />,
          document.body
        )}
    </div>
  );
}

function ImageZoomViewer({
  images,
  initialIndex,
  name,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  name: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(images.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, images.length]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black" role="dialog" aria-modal="true" aria-label={`${name} zoomed image`}>
      <div className="flex items-center justify-between p-4">
        <span className="text-sm font-medium text-white/80">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="relative flex-1 overflow-auto" onDoubleClick={() => setZoomed((z) => !z)}>
        <div className="flex min-h-full items-center justify-center">
          <div className={cn("relative aspect-square w-full shrink-0 transition-transform duration-200", zoomed && "scale-[2]")}>
            <Image src={images[index]} alt={`${name} — image ${index + 1}`} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      </div>

      <p className="pb-1 text-center text-xs text-white/50">Pinch or double-tap to zoom</p>

      {images.length > 1 && (
        <div className="flex items-center justify-center gap-4 p-4 pt-2">
          <button
            type="button"
            aria-label="Previous image"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-lg text-white disabled:opacity-30"
          >
            ‹
          </button>
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to image ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-white" : "w-1.5 bg-white/40")}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next image"
            disabled={index === images.length - 1}
            onClick={() => setIndex((i) => Math.min(images.length - 1, i + 1))}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-lg text-white disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
