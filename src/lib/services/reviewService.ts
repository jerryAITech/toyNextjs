import { connectDB } from "@/lib/db/connect";
import { ReviewModel } from "@/lib/models/Review";
import { OrderModel } from "@/lib/models/Order";
import { ProductModel } from "@/lib/models/Product";
import { UserModel } from "@/lib/models/User";
import { ApiError } from "@/lib/utils/response";

async function recomputeProductRating(productId: string) {
  const stats = await ReviewModel.aggregate([
    { $match: { productId: productId, status: "APPROVED" } },
    { $group: { _id: "$productId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await ProductModel.findByIdAndUpdate(productId, {
    rating: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
}

export async function getProductReviews(productId: string) {
  await connectDB();
  const reviews = await ReviewModel.find({ productId, status: "APPROVED" }).sort({ createdAt: -1 }).lean();
  const userIds = reviews.map((r) => r.userId);
  const users = await UserModel.find({ _id: { $in: userIds } }).select("name").lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return {
    reviews: reviews.map((r) => ({ ...r, userName: userMap.get(r.userId.toString()) || "ToyStore Customer" })),
    distribution,
    average: reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
    total: reviews.length,
  };
}

export async function getRecentApprovedReviews(limit = 6) {
  await connectDB();
  const reviews = await ReviewModel.find({ status: "APPROVED", rating: { $gte: 4 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "name")
    .populate("productId", "name slug images")
    .lean();
  return reviews;
}

export async function canUserReview(userId: string, productId: string) {
  await connectDB();
  const [alreadyReviewed, purchase] = await Promise.all([
    ReviewModel.exists({ userId, productId }),
    OrderModel.findOne({
      userId,
      orderStatus: "DELIVERED",
      "items.productId": productId,
    }).select("_id"),
  ]);

  return { canReview: !alreadyReviewed && !!purchase, alreadyReviewed: !!alreadyReviewed, verifiedPurchase: !!purchase, orderId: purchase?._id };
}

export async function createReview(userId: string, productId: string, rating: number, comment: string) {
  await connectDB();
  const { canReview, alreadyReviewed, orderId } = await canUserReview(userId, productId);
  if (alreadyReviewed) throw new ApiError("You have already reviewed this product.", 409);
  if (!canReview) throw new ApiError("Only customers who purchased and received this product can review it.", 403);

  const review = await ReviewModel.create({
    userId,
    productId,
    orderId,
    rating,
    comment,
    verifiedPurchase: true,
    status: "APPROVED",
  });

  await recomputeProductRating(productId);
  return review;
}

export async function updateReview(userId: string, reviewId: string, rating: number, comment: string) {
  await connectDB();
  const review = await ReviewModel.findOne({ _id: reviewId, userId });
  if (!review) throw new ApiError("Review not found.", 404);

  review.rating = rating;
  review.comment = comment;
  await review.save();
  await recomputeProductRating(review.productId.toString());
  return review;
}

export async function deleteReview(userId: string, reviewId: string) {
  await connectDB();
  const review = await ReviewModel.findOneAndDelete({ _id: reviewId, userId });
  if (!review) throw new ApiError("Review not found.", 404);
  await recomputeProductRating(review.productId.toString());
}

export async function listAllReviewsForAdmin() {
  await connectDB();
  const reviews = await ReviewModel.find().sort({ createdAt: -1 }).populate("userId", "name email").populate("productId", "name slug").lean();
  return reviews;
}

export async function moderateReview(reviewId: string, status: "APPROVED" | "REJECTED" | "HIDDEN") {
  await connectDB();
  const review = await ReviewModel.findByIdAndUpdate(reviewId, { status }, { new: true });
  if (!review) throw new ApiError("Review not found.", 404);
  await recomputeProductRating(review.productId.toString());
  return review;
}

export async function adminDeleteReview(reviewId: string) {
  await connectDB();
  const review = await ReviewModel.findByIdAndDelete(reviewId);
  if (review) await recomputeProductRating(review.productId.toString());
}
