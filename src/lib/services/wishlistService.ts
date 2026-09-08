import { connectDB } from "@/lib/db/connect";
import { WishlistModel } from "@/lib/models/Wishlist";
import { ProductModel } from "@/lib/models/Product";

export async function getWishlist(userId: string) {
  await connectDB();
  const entries = await WishlistModel.find({ userId }).sort({ createdAt: -1 }).lean();
  const productIds = entries.map((e) => e.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  return entries
    .map((e) => productMap.get(e.productId.toString()))
    .filter((p): p is NonNullable<typeof p> => !!p);
}

export async function isWishlisted(userId: string, productId: string) {
  await connectDB();
  return !!(await WishlistModel.exists({ userId, productId }));
}

export async function getWishlistProductIds(userId: string) {
  await connectDB();
  const entries = await WishlistModel.find({ userId }).select("productId").lean();
  return entries.map((e) => e.productId.toString());
}

export async function addToWishlist(userId: string, productId: string) {
  await connectDB();
  await WishlistModel.updateOne({ userId, productId }, { $setOnInsert: { userId, productId } }, { upsert: true });
}

export async function removeFromWishlist(userId: string, productId: string) {
  await connectDB();
  await WishlistModel.deleteOne({ userId, productId });
}
