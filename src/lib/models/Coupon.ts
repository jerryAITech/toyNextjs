import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
    value: { type: Number, required: true, min: 0 },

    minimumCartValue: { type: Number, default: 0 },
    maximumDiscount: { type: Number, default: null },

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },

    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },

    applicableProducts: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
    applicableCategories: { type: [Schema.Types.ObjectId], ref: "Category", default: [] },
    firstOrderOnly: { type: Boolean, default: false },

    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export type Coupon = InferSchemaType<typeof couponSchema> & { _id: string };

export const CouponModel: Model<Coupon> = models.Coupon || model<Coupon>("Coupon", couponSchema);
