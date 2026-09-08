import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex size-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center">
            {showEllipsis && <span className="px-1 text-ink-400">…</span>}
            <button
              onClick={() => onChange(p)}
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-sm font-semibold",
                p === page ? "bg-primary-500 text-white" : "text-ink-600 hover:bg-ink-100"
              )}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex size-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
