import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function AccountBackLink({ href = "/account", label = "Back to Account" }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-primary-600">
      <ChevronLeft size={16} />
      {label}
    </Link>
  );
}
