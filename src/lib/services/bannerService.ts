import { connectDB } from "@/lib/db/connect";
import { BannerModel } from "@/lib/models/Banner";
import { ApiError } from "@/lib/utils/response";
import type { BannerInput } from "@/lib/validation/banner";

function activeDateFilter() {
  const now = new Date();
  return {
    status: "ACTIVE" as const,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  };
}

export async function getActiveBanners(type: "HOME" | "CATEGORY", categoryId?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { type, ...activeDateFilter() };
  if (type === "CATEGORY") filter.categoryId = categoryId;

  return BannerModel.find(filter)
    .sort({ priority: -1, createdAt: -1 })
    .populate("productId", "slug")
    .populate("linkedCategoryId", "slug")
    .lean();
}

export async function listAllBanners(type?: "HOME" | "CATEGORY") {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  return BannerModel.find(filter)
    .sort({ type: 1, priority: -1, createdAt: -1 })
    .populate("categoryId", "name slug")
    .populate("productId", "name slug")
    .populate("linkedCategoryId", "name slug")
    .lean();
}

export async function getBannerById(id: string) {
  await connectDB();
  return BannerModel.findById(id).lean();
}

export async function createBanner(input: BannerInput) {
  await connectDB();
  if (input.type === "CATEGORY" && !input.categoryId) {
    throw new ApiError("A category must be selected for category banners.", 422);
  }
  return BannerModel.create({
    ...input,
    categoryId: input.type === "CATEGORY" ? input.categoryId : null,
    productId: input.linkType === "PRODUCT" ? input.productId : null,
    linkedCategoryId: input.linkType === "CATEGORY" ? input.linkedCategoryId : null,
    customUrl: input.linkType === "URL" ? input.customUrl : null,
    startDate: input.startDate || null,
    endDate: input.endDate || null,
  });
}

export async function updateBanner(id: string, input: Partial<BannerInput>) {
  await connectDB();
  const banner = await BannerModel.findById(id);
  if (!banner) throw new ApiError("Banner not found.", 404);

  Object.assign(banner, input);
  if (input.type === "CATEGORY" && !banner.categoryId) {
    throw new ApiError("A category must be selected for category banners.", 422);
  }
  await banner.save();
  return banner;
}

export async function deleteBanner(id: string) {
  await connectDB();
  await BannerModel.findByIdAndDelete(id);
}

export async function toggleBannerStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  await connectDB();
  const banner = await BannerModel.findByIdAndUpdate(id, { status }, { new: true });
  if (!banner) throw new ApiError("Banner not found.", 404);
  return banner;
}
