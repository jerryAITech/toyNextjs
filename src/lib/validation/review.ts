import { z } from "zod";

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Please write at least a few words").max(1000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
