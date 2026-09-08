export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "PAYMENT_FAILED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
