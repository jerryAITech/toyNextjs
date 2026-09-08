import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs text-ink-500">
      <Link href="/" className="flex items-center gap-1 hover:text-primary-600">
        <Home size={13} />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex shrink-0 items-center gap-1.5">
          <ChevronRight size={12} />
          {item.href && i !== items.length - 1 ? (
            <Link href={item.href} className="hover:text-primary-600">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink-700" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
