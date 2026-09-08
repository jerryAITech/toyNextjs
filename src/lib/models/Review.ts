import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, required: true },
    verifiedPurchase: { type: Boolean, default: false },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "HIDDEN"], default: "APPROVED" },
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export type Review = InferSchemaType<typeof reviewSchema> & { _id: string };

export const ReviewModel: Model<Review> = models.Review || model<Review>("Review", reviewSchema);
