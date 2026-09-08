import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StarRating({
  rating,
  size = 14,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rating >= i;
        const half = !filled && rating >= i - 0.5;

        // Only a genuine half-star needs two stacked icons (gray base + clipped overlay) — a
        // whole star or an empty one renders as a single icon. Ratings are almost always whole
        // numbers, so this cuts a StarRating instance from ~31 DOM nodes down to ~11 in the
        // common case, across every product card and review on the site.
        if (!half) {
          return <Star key={i} size={size} className={filled ? "text-sun-500 fill-sun-500" : "text-ink-200"} />;
        }

        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-ink-200" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
              <Star size={size} className="text-sun-500 fill-sun-500" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
