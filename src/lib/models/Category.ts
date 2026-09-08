import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true },
    tagline: { type: String, trim: true },
    image: { type: String, trim: true },
    icon: { type: String, trim: true },
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    displayOrder: { type: Number, default: 0 },
    seoTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export type Category = InferSchemaType<typeof categorySchema> & { _id: string };

export const CategoryModel: Model<Category> =
  models.Category || model<Category>("Category", categorySchema);
