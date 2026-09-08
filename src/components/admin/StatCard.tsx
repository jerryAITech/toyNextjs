import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: "primary" | "accent" | "mint" | "sun" | "berry";
}) {
  const toneClasses: Record<string, string> = {
    primary: "bg-primary-50 text-primary-600",
    accent: "bg-accent-50 text-accent-600",
    mint: "bg-mint-100 text-mint-700",
    sun: "bg-sun-100 text-accent-600",
    berry: "bg-berry-400/10 text-berry-500",
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
      <div className={cn("mb-3 flex size-10 items-center justify-center rounded-xl", toneClasses[tone])}>
        <Icon size={19} />
      </div>
      <p className="text-xs font-medium text-ink-400">{label}</p>
      <p className="mt-0.5 font-display text-xl font-bold text-ink-900">{value}</p>
    </div>
  );
}
