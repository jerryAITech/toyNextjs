import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-soft",
  // accent-500 with white text sits at ~3.2:1, short of WCAG AA — accent-700 clears it (~6.2:1).
  accent: "bg-accent-700 text-white hover:bg-accent-800 active:bg-accent-900 shadow-soft",
  secondary: "bg-sun-400 text-ink-900 hover:bg-sun-500 shadow-soft",
  outline: "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 bg-white",
  ghost: "text-ink-700 hover:bg-ink-100",
  // --color-danger (#ef4444) with white text sits at ~3.76:1 — red-600 clears it (~4.83:1).
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-150 motion-safe:active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
