import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const wishlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  },
  { timestamps: true }
);

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export type Wishlist = InferSchemaType<typeof wishlistSchema> & { _id: string };

export const WishlistModel: Model<Wishlist> =
  models.Wishlist || model<Wishlist>("Wishlist", wishlistSchema);
