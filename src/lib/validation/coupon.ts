import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(30),
  description: z.string().trim().optional().or(z.literal("")),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().positive(),
  minimumCartValue: z.coerce.number().min(0).default(0),
  maximumDiscount: z.coerce.number().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  usageLimit: z.coerce.number().int().nullable().optional(),
  perUserLimit: z.coerce.number().int().min(1).default(1),
  applicableProducts: z.array(z.string()).default([]),
  applicableCategories: z.array(z.string()).default([]),
  firstOrderOnly: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type CouponInput = z.infer<typeof couponSchema>;
