import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession, requireUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/lib/models/User";
import { ok, handleApiError, ApiError } from "@/lib/utils/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ok({ user: null });

    await connectDB();
    const user = await UserModel.findById(session.sub);
    if (!user || user.status === "INACTIVE") return ok({ user: null });

    return ok({
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireUser();
    const body = updateSchema.parse(await req.json());

    await connectDB();
    const user = await UserModel.findById(session.sub);
    if (!user) throw new ApiError("User not found.", 404);

    user.name = body.name;
    user.mobile = body.mobile || undefined;
    await user.save();

    return ok({ id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role });
  } catch (err) {
    return handleApiError(err);
  }
}
