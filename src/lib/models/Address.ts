import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const addressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    house: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    type: { type: String, enum: ["HOME", "WORK", "OTHER"], default: "HOME" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type Address = InferSchemaType<typeof addressSchema> & { _id: string };

export const AddressModel: Model<Address> =
  models.Address || model<Address>("Address", addressSchema);
