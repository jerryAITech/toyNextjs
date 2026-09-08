import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" className={cn("shrink-0", className)}>
      <rect x="3" y="20" width="16" height="16" rx="4" fill="#3366FF" />
      <rect x="21" y="20" width="16" height="16" rx="4" fill="#FA5A1F" />
      <rect x="12" y="3" width="16" height="16" rx="4" fill="#FFB703" />
    </svg>
  );
}

export function Logo({
  href = "/",
  size = 28,
  wordmarkClassName = "text-2xl text-primary-600",
}: {
  href?: string;
  size?: number;
  wordmarkClassName?: string;
}) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2">
      <LogoMark size={size} />
      <span className={cn("font-display font-extrabold", wordmarkClassName)}>
        Toy<span className="text-accent-500">Store</span>
      </span>
    </Link>
  );
}
