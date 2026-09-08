import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/lib/models/User";
import { OrderModel } from "@/lib/models/Order";
import { ReviewModel } from "@/lib/models/Review";
import { ApiError } from "@/lib/utils/response";

export async function listUsers(q?: string, status?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { role: "USER" };
  if (status && status !== "all") filter.status = status;
  if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
  return UserModel.find(filter).sort({ createdAt: -1 }).lean();
}

export async function getUserDetail(id: string) {
  await connectDB();
  const user = await UserModel.findById(id).lean();
  if (!user) throw new ApiError("User not found.", 404);

  const [orders, reviews] = await Promise.all([
    OrderModel.find({ userId: id }).sort({ createdAt: -1 }).lean(),
    ReviewModel.find({ userId: id }).populate("productId", "name slug").sort({ createdAt: -1 }).lean(),
  ]);

  return { user, orders, reviews };
}

export async function setUserStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  await connectDB();
  const user = await UserModel.findByIdAndUpdate(id, { status }, { new: true });
  if (!user) throw new ApiError("User not found.", 404);
  return user;
}
