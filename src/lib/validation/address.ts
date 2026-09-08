import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  house: z.string().trim().min(1).max(120),
  street: z.string().trim().min(1).max(160),
  area: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  landmark: z.string().trim().max(120).optional().or(z.literal("")),
  type: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
