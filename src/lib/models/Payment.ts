import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["RAZORPAY", "COD"], required: true },
    status: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING" },
    failureReason: { type: String, default: null },
  },
  { timestamps: true }
);

export type Payment = InferSchemaType<typeof paymentSchema> & { _id: string };

export const PaymentModel: Model<Payment> =
  models.Payment || model<Payment>("Payment", paymentSchema);
