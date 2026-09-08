import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    ownerType: { type: String, enum: ["USER", "GUEST"], required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    guestId: { type: String, default: null, index: true },
    items: { type: [cartItemSchema], default: [] },
    couponCode: { type: String, default: null },
  },
  { timestamps: true }
);

export type Cart = InferSchemaType<typeof cartSchema> & { _id: string };

export const CartModel: Model<Cart> = models.Cart || model<Cart>("Cart", cartSchema);
