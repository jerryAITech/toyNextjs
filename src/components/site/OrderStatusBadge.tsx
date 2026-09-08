import { Badge } from "@/components/ui/Badge";

const TONE_MAP: Record<string, "success" | "warning" | "danger" | "primary" | "neutral"> = {
  PENDING: "warning",
  CONFIRMED: "primary",
  PROCESSING: "primary",
  PACKED: "primary",
  SHIPPED: "primary",
  OUT_FOR_DELIVERY: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
  PAYMENT_FAILED: "danger",
};

const LABEL_MAP: Record<string, string> = {
  OUT_FOR_DELIVERY: "Out for Delivery",
  PAYMENT_FAILED: "Payment Failed",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge tone={TONE_MAP[status] || "neutral"}>{LABEL_MAP[status] || status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
}
