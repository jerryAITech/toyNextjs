import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  size = "md",
  disabled,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}) {
  const btnSize = size === "sm" ? "size-7" : "size-9";

  return (
    <div className={cn("inline-flex items-center justify-between rounded-full border border-ink-200 bg-white", disabled && "opacity-50", className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn("flex items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 disabled:opacity-40", btnSize)}
      >
        <Minus size={14} />
      </button>
      <span className="min-w-[2rem] text-center text-sm font-semibold text-ink-900">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        className={cn("flex items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 disabled:opacity-40", btnSize)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
