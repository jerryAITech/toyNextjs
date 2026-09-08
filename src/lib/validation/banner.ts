import { z } from "zod";

export const bannerSchema = z.object({
  type: z.enum(["HOME", "CATEGORY"]),
  categoryId: z.string().nullable().optional(),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  subtitle: z.string().trim().max(160).optional().or(z.literal("")),
  desktopImage: z.string().min(1, "Desktop image is required"),
  mobileImage: z.string().min(1, "Mobile image is required"),
  ctaText: z.string().trim().max(40).default("Shop Now"),
  linkType: z.enum(["PRODUCT", "CATEGORY", "URL", "NONE"]).default("NONE"),
  productId: z.string().nullable().optional(),
  linkedCategoryId: z.string().nullable().optional(),
  customUrl: z.string().trim().optional().or(z.literal("")),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  priority: z.coerce.number().int().default(0),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type BannerInput = z.infer<typeof bannerSchema>;
