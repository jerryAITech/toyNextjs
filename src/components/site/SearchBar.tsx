"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { formatINR } from "@/lib/utils/pricing";
import { cn } from "@/lib/utils/cn";

type Suggestion = { _id: string; name: string; slug: string; images: string[]; price: number; mrp: number; stock: number };

export function SearchBar({ className, autoFocus, onNavigate }: { className?: string; autoFocus?: boolean; onNavigate?: () => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setSuggestions(json.data?.results ?? []);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goToResults() {
    if (!query.trim()) return;
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 shadow-soft focus-within:ring-2 focus-within:ring-primary-400">
        <Search size={18} className="shrink-0 text-ink-400" />
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && goToResults()}
          placeholder="Search for toys, brands..."
          className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search">
            <X size={16} className="text-ink-400" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lifted">
          {suggestions.map((s) => (
            <Link
              key={s._id}
              href={`/product/${s.slug}`}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-ink-50"
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                {s.images[0] && <Image src={s.images[0]} alt={s.name} fill sizes="40px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-800">{s.name}</p>
                <p className="text-xs text-ink-400">
                  {formatINR(s.price)} {s.stock <= 0 && <span className="text-danger">· Out of stock</span>}
                </p>
              </div>
            </Link>
          ))}
          <button onClick={goToResults} className="w-full border-t border-ink-100 py-2 text-center text-sm font-semibold text-primary-600 hover:bg-primary-50">
            View all results for &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
}
