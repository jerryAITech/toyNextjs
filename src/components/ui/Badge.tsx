import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type Tone = "accent" | "success" | "warning" | "danger" | "primary" | "neutral";

const toneClasses: Record<Tone, string> = {
  // accent-500 with white text sits at ~3.2:1 contrast, short of WCAG AA's 4.5:1 for small bold
  // text — accent-700 clears it comfortably (~6.2:1) while staying the same hue.
  accent: "bg-accent-700 text-white",
  // mint-600 on mint-100 sits at ~3.9:1, short of WCAG AA — mint-700 clears it at ~5.9:1.
  success: "bg-mint-100 text-mint-700",
  warning: "bg-sun-100 text-accent-700",
  danger: "bg-red-100 text-danger",
  primary: "bg-primary-100 text-primary-700",
  neutral: "bg-ink-100 text-ink-600",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
