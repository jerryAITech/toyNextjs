import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const bannerSchema = new Schema(
  {
    type: { type: String, enum: ["HOME", "CATEGORY"], required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null, index: true },

    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    desktopImage: { type: String, required: true },
    mobileImage: { type: String, required: true },
    ctaText: { type: String, trim: true, default: "Shop Now" },

    linkType: { type: String, enum: ["PRODUCT", "CATEGORY", "URL", "NONE"], default: "NONE" },
    productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    linkedCategoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    customUrl: { type: String, trim: true },

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    priority: { type: Number, default: 0 },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

bannerSchema.index({ type: 1, categoryId: 1, status: 1, priority: 1 });

export type Banner = InferSchemaType<typeof bannerSchema> & { _id: string };

export const BannerModel: Model<Banner> = models.Banner || model<Banner>("Banner", bannerSchema);
