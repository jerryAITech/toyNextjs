import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const AGE_GROUPS = ["0-2", "3-5", "6-8", "9-12", "13+"] as const;

const specificationSchema = new Schema(
  { key: { type: String, required: true, trim: true }, value: { type: String, required: true, trim: true } },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    brand: { type: String, trim: true, default: "ToyStore" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subcategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },

    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },

    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },

    ageGroup: { type: String, enum: AGE_GROUPS, required: true },
    description: { type: String, trim: true },
    highlights: { type: [String], default: [] },
    specifications: { type: [specificationSchema], default: [] },
    material: { type: String, trim: true },
    dimensions: { type: String, trim: true },
    safetyInformation: { type: String, trim: true },
    whatsIncluded: { type: [String], default: [] },
    manufacturer: { type: String, trim: true },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 5,
        message: "A product can have at most 5 images.",
      },
    },
    video: { type: String, default: null },

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    seoTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: { type: [String], default: [] },
    canonicalUrl: { type: String, trim: true },
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },

    codAvailable: { type: Boolean, default: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", keywords: "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ ageGroup: 1 });

productSchema.virtual("discountPercent").get(function (this: { price: number; mrp: number }) {
  if (!this.mrp || this.mrp <= this.price) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export type Product = InferSchemaType<typeof productSchema> & {
  _id: string;
  discountPercent?: number;
};

export const ProductModel: Model<Product> =
  models.Product || model<Product>("Product", productSchema);
