import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type CheckoutStep = { label: string; done: boolean };

export function CheckoutStepper({ steps }: { steps: CheckoutStep[] }) {
  const activeIndex = steps.findIndex((s) => !s.done);
  const currentIndex = activeIndex === -1 ? steps.length - 1 : activeIndex;

  return (
    <div className="mb-6 flex items-center">
      {steps.map((step, i) => {
        const isCurrent = i === currentIndex;
        const isDone = step.done && i !== currentIndex;
        return (
          <div key={step.label} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  isDone ? "bg-mint-500 text-white" : isCurrent ? "bg-primary-500 text-white" : "bg-ink-100 text-ink-400"
                )}
              >
                {isDone ? <Check size={16} /> : i + 1}
              </div>
              <span className={cn("whitespace-nowrap text-[11px] font-semibold sm:text-xs", isCurrent ? "text-primary-600" : isDone ? "text-mint-700" : "text-ink-400")}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1 rounded-full transition-colors sm:mx-3", isDone ? "bg-mint-400" : "bg-ink-100")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
