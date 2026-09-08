import { formatINR } from "@/lib/utils/pricing";

export function AnnouncementBar({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  return (
    <div className="hidden bg-primary-600 py-1.5 text-center text-xs font-medium text-white md:block">
      🚚 Free delivery above {formatINR(freeShippingThreshold)}
    </div>
  );
}
