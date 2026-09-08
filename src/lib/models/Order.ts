import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ORDER_STATUSES } from "@/lib/constants/orderStatus";

export { ORDER_STATUSES };

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String, required: true },
    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    finalPrice: { type: Number, required: true },
  },
  { _id: false }
);

const addressSnapshotSchema = new Schema(
  {
    fullName: String,
    mobile: String,
    house: String,
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    type: String,
  },
  { _id: false }
);

const timelineEventSchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    addressSnapshot: { type: addressSnapshotSchema, required: true },

    subtotal: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    couponCode: { type: String, default: null },
    couponDiscount: { type: Number, required: true, default: 0 },
    shipping: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ["RAZORPAY", "COD"], required: true },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING" },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: "PENDING" },

    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },

    timeline: { type: [timelineEventSchema], default: [] },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: null },
    stockRestored: { type: Boolean, default: false },
    deliveryEstimate: { type: String, default: null },
  },
  { timestamps: true }
);

export type Order = InferSchemaType<typeof orderSchema> & { _id: string };

export const OrderModel: Model<Order> = models.Order || model<Order>("Order", orderSchema);
