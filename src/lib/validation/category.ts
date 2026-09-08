import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  tagline: z.string().trim().max(120).optional().or(z.literal("")),
  image: z.string().trim().optional().or(z.literal("")),
  icon: z.string().trim().optional().or(z.literal("")),
  parentCategory: z.string().trim().nullable().optional(),
  displayOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
