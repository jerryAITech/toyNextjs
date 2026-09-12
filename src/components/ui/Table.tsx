import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft">
      <table className={cn("w-full min-w-[640px] border-collapse text-left text-sm", className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 border-b-2 border-primary-200 bg-primary-50/70 text-[11px] font-bold uppercase tracking-wider text-ink-700">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  // Subtle zebra striping (nth-child, so no per-row index plumbing needed) — hover still wins
  // since it's defined on the row itself and matched after the parent's nth-child rule.
  return <tbody className="divide-y divide-ink-100 [&>tr:nth-child(even)]:bg-ink-50/50">{children}</tbody>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("transition-colors hover:bg-primary-50/70", className)}>{children}</tr>;
}

export function TH({ children, className, numeric }: { children: React.ReactNode; className?: string; numeric?: boolean }) {
  return <th className={cn("px-5 py-4", numeric && "text-right", className)}>{children}</th>;
}

export function TD({ children, className, numeric }: { children: React.ReactNode; className?: string; numeric?: boolean }) {
  return (
    <td className={cn("px-5 py-4 align-middle text-ink-700", numeric && "text-right tabular-nums", className)}>{children}</td>
  );
}

export function TableActionButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-primary-100 hover:text-primary-700 active:scale-95",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TableActionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-primary-100 hover:text-primary-700 active:scale-95",
        className
      )}
    >
      {children}
    </Link>
  );
}
