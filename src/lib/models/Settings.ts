import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const settingsSchema = new Schema(
  {
    key: { type: String, default: "singleton", unique: true },
    storeName: { type: String, default: "ToyStore" },
    logo: { type: String, default: "" },
    contactEmail: { type: String, default: "support@toystore.dev" },
    contactPhone: { type: String, default: "+91 90000 00000" },
    address: { type: String, default: "" },
    currency: { type: String, default: "INR" },

    codEnabled: { type: Boolean, default: true },
    codMaxOrderAmount: { type: Number, default: 20000 },

    razorpayEnabled: { type: Boolean, default: true },

    shippingFee: { type: Number, default: 49 },
    freeShippingThreshold: { type: Number, default: 999 },

    cancellationWindowStatus: { type: String, default: "PACKED" },
    lowStockThreshold: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export type Settings = InferSchemaType<typeof settingsSchema> & { _id: string };

export const SettingsModel: Model<Settings> =
  models.Settings || model<Settings>("Settings", settingsSchema);
