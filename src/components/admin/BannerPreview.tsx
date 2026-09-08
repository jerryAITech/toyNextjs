import Image from "next/image";
import { ImageOff } from "lucide-react";

export function BannerPreview({
  desktopImage,
  mobileImage,
  title,
  subtitle,
  ctaText,
}: {
  desktopImage?: string;
  mobileImage?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PreviewBox
        label="Desktop Preview"
        aspect="aspect-[3/1]"
        image={desktopImage}
        title={title}
        subtitle={subtitle}
        ctaText={ctaText}
      />
      <PreviewBox
        label="Mobile Preview"
        aspect="aspect-[16/7]"
        image={mobileImage}
        title={title}
        subtitle={subtitle}
        ctaText={ctaText}
      />
    </div>
  );
}

function PreviewBox({
  label,
  aspect,
  image,
  title,
  subtitle,
  ctaText,
}: {
  label: string;
  aspect: string;
  image?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <div className={`relative w-full overflow-hidden rounded-2xl bg-ink-50 ${aspect}`}>
        {image ? (
          <>
            <Image src={image} alt={title || "Banner preview"} fill sizes="400px" className="object-cover" />
            {(title || subtitle || ctaText) && (
              <div className="absolute inset-0 flex flex-col justify-center gap-1.5 bg-gradient-to-r from-black/40 via-black/10 to-transparent p-4 sm:p-5">
                {title && (
                  <h3 className="font-display text-sm font-extrabold text-white drop-shadow sm:text-lg">{title}</h3>
                )}
                {subtitle && <p className="max-w-[80%] text-[11px] text-white/90 sm:text-xs">{subtitle}</p>}
                {ctaText && (
                  <span className="mt-1 inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-ink-900 shadow-soft sm:px-4 sm:py-1.5 sm:text-xs">
                    {ctaText}
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 text-ink-400">
            <ImageOff size={22} />
            <span className="text-xs font-medium">No image uploaded yet</span>
          </div>
        )}
      </div>
    </div>
  );
}
