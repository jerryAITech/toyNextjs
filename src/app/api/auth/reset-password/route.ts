import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { resetPassword } from "@/lib/services/authService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = resetPasswordSchema.parse(await req.json());
    await resetPassword(token, password);
    return ok({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    return handleApiError(err);
  }
}
