import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-ink-50 px-6 py-14 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-soft">
        <Icon className="size-8 text-primary-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-800">{title}</h3>
      {description && <p className="max-w-xs text-sm text-ink-500">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-1 inline-flex h-9 items-center justify-center rounded-full bg-primary-500 px-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-600"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
