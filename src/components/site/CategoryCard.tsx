import Image from "next/image";
import Link from "next/link";

export function CategoryCard({ name, slug, image }: { name: string; slug: string; image?: string | null }) {
  return (
    <Link href={`/category/${slug}`} className="flex shrink-0 flex-col items-center gap-2 text-center">
      <div className="relative size-16 overflow-hidden rounded-2xl bg-ink-100 shadow-soft sm:size-20 lg:size-24">
        {image ? (
          <Image src={image} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl">🧸</div>
        )}
      </div>
      <span className="line-clamp-3 h-12 w-16 text-xs font-medium leading-tight text-ink-700 sm:h-[60px] sm:w-24 sm:text-sm">{name}</span>
    </Link>
  );
}
