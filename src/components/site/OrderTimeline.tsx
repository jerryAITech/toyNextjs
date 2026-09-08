import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FLOW = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
const LABELS: Record<string, string> = {
  PENDING: "Ordered",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  if (currentStatus === "CANCELLED" || currentStatus === "PAYMENT_FAILED") {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-danger">
        {currentStatus === "CANCELLED" ? "This order has been cancelled." : "Payment failed for this order."}
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(currentStatus);

  return (
    <div className="flex flex-col gap-0">
      {FLOW.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === FLOW.length - 1;
        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", done ? "bg-mint-500 text-white" : "bg-ink-100 text-ink-400")}>
                {done ? <Check size={13} /> : <span className="size-1.5 rounded-full bg-ink-300" />}
              </div>
              {!isLast && <div className={cn("w-0.5 flex-1", i < currentIndex ? "bg-mint-500" : "bg-ink-100")} style={{ minHeight: 24 }} />}
            </div>
            <span className={cn("pb-6 text-sm", done ? "font-semibold text-ink-800" : "text-ink-400")}>{LABELS[step]}</span>
          </div>
        );
      })}
    </div>
  );
}
