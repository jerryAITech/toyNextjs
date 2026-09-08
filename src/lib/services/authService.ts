import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/lib/models/User";
import { CartModel } from "@/lib/models/Cart";
import { hashPassword, verifyPassword, generateToken, hashToken } from "@/lib/auth/password";
import { ApiError } from "@/lib/utils/response";
import type { z } from "zod";
import type { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "@/lib/validation/auth";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

export async function signup(input: z.infer<typeof signupSchema>) {
  await connectDB();
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) throw new ApiError("An account with this email already exists.", 409);

  const password = await hashPassword(input.password);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    mobile: input.mobile || undefined,
    password,
    role: "USER",
  });

  return user;
}

export async function login(input: z.infer<typeof loginSchema>) {
  await connectDB();
  const user = await UserModel.findOne({ email: input.email }).select("+password");
  if (!user) throw new ApiError("Invalid email or password.", 401);
  if (user.status === "INACTIVE") throw new ApiError("This account has been deactivated.", 403);

  const valid = await verifyPassword(input.password, user.password);
  if (!valid) throw new ApiError("Invalid email or password.", 401);

  return user;
}

export async function mergeGuestCartIntoUser(userId: string, guestId: string | null) {
  if (!guestId) return;
  await connectDB();

  const guestCart = await CartModel.findOne({ ownerType: "GUEST", guestId });
  if (!guestCart || guestCart.items.length === 0) return;

  let userCart = await CartModel.findOne({ ownerType: "USER", userId });
  if (!userCart) {
    userCart = await CartModel.create({ ownerType: "USER", userId, items: [] });
  }

  for (const guestItem of guestCart.items) {
    const existing = userCart.items.find((i) => i.productId.toString() === guestItem.productId.toString());
    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      userCart.items.push({ productId: guestItem.productId, quantity: guestItem.quantity });
    }
  }

  await userCart.save();
  await CartModel.deleteOne({ _id: guestCart._id });
}

export async function requestPasswordReset(email: string) {
  await connectDB();
  const user = await UserModel.findOne({ email });
  if (!user) {
    // Don't reveal whether the account exists.
    return null;
  }

  const token = generateToken();
  user.resetPasswordTokenHash = hashToken(token);
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  // No email provider is configured yet — log the link so it's usable in dev.
  console.log(`[password reset] ${email}: ${resetUrl}`);

  return resetUrl;
}

export async function resetPassword(token: string, newPassword: string) {
  await connectDB();
  const tokenHash = hashToken(token);
  const user = await UserModel.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordTokenHash +resetPasswordExpires");

  if (!user) throw new ApiError("This reset link is invalid or has expired.", 400);

  user.password = await hashPassword(newPassword);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  await connectDB();
  const user = await UserModel.findById(userId).select("+password");
  if (!user) throw new ApiError("User not found.", 404);

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) throw new ApiError("Current password is incorrect.", 400);

  user.password = await hashPassword(newPassword);
  await user.save();
}
