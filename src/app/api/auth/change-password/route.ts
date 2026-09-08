import { NextRequest } from "next/server";
import { changePasswordSchema } from "@/lib/validation/auth";
import { changePassword } from "@/lib/services/authService";
import { requireUser } from "@/lib/auth/session";
import { ok, handleApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const { currentPassword, newPassword } = changePasswordSchema.parse(await req.json());
    await changePassword(session.sub, currentPassword, newPassword);
    return ok({ message: "Password updated successfully." });
  } catch (err) {
    return handleApiError(err);
  }
}
