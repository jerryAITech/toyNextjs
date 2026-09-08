"use client";

import { cn } from "@/lib/utils/cn";

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { value: string; label: string; count?: number }[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto no-scrollbar", className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            active === tab.value ? "bg-primary-500 text-white shadow-soft" : "bg-ink-100 text-ink-600 hover:bg-ink-200"
          )}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1.5 opacity-70">({tab.count})</span>}
        </button>
      ))}
    </div>
  );
}
